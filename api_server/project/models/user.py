# encoding: utf-8

"""
    shennong db
    Good man is well
"""
import random
import time
import os
import sys
import datetime
import json
from bson import ObjectId, json_util

from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

import pymongo

from project.models import user_db_client
from project.models import redis_db, CURRENT_USER_ID
from project.ext.short_message import send_short_message
from project.ext.easemob import EasemobIM
from project import app

user_db = user_db_client.shennong
user_collection = user_db.user_collection
# user_db.user_collection.create_index("_id")

if redis_db.get(CURRENT_USER_ID) is None:
    redis_db.set(CURRENT_USER_ID, '10000')

im_obj = EasemobIM(app.logger)

# These keys are intentionally short, so as to save on memory in redis
FRIENDS_KEY = 'FR'
FOLLOWS_KEY = 'F'
FOLLOWERS_KEY = 'f'
BLOCKS_KEY = 'B'
BLOCKED_KEY = 'b'

USERID_KEY = 'U'

class User(object):

    def __init__(self, user_id=None):
        app.logger.debug("user instance %s init" % user_id)
        self.user_id = user_id

        """
        self.score = 0
        self.phone = None
        self.friends = set()
        self.feeds = set()
        self.followers = set()
        self.type = 0  # user/shangjia/qiye/aixinshe/jijinhui
        self.head_pic = ''
        self.notes = ''
        """

    def __repr__(self):
        return '<User %r>' % (self.user_id)

    def is_authenticated(self):
        app.logger.debug("authenticated")
        return True

    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        """
        Assuming that the user object has an `id` attribute, this will take
        that and convert it to `unicode`.
        """
        try:
            return self.user_id
        except AttributeError:
            raise NotImplementedError("No `id` attribute - override get_id")

    def show_user(self):
        app.logger.debug("show user %s" % self.user_id)
        result = user_collection.find_one({'_id': self.user_id})  # ObjectId(self.user_id)})
        if result:
            try:
                del result['passwd_hash']
            except Exception, e:
                app.logger.error("del key passwd_hash error:%s", e)

        # app.logger.debug("show user %s" % result)
        # if result has ObjectId type, then must change type as follow, otherwise will wrong
        # ret = json.dumps(result, default=json_util.default)
        # app.logger.debug("show user %s" % ret)
        # return json.loads(ret)
        return result

    @classmethod
    def get_user_from_token(cls, token):
        app.logger.debug("get user from token:%s\n" % token)
        # get account from redis according token
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        except:
            return None

        user_id = data['user_id']
        user = User(user_id)

        # users last online time, may be update redis not mongodb
        mytime = int(time.time())
        infos = dict()
        infos['last_update'] = mytime
        user.modify_user(infos, update='modify')

        app.logger.debug("get user from token:%s %s\n" % (token, user.user_id))
        return user

    @classmethod
    def add_user(cls, account=None, passwd=None):
        app.logger.debug("add user start:[%s,%s]" % (account, passwd))
        # check if account has register
        result_find = user_collection.find_one({'account': account})
        if result_find:
            db_passwd_hash = result_find.get('passwd_hash')
            user_id = result_find.get('_id')
            s = Serializer(app.config['SECRET_KEY'], expires_in=6000)  # 3600000=41 days
            token = s.dumps({'user_id': '%s' % user_id, 'passwd': db_passwd_hash})
            app.logger.debug("user exsit [account:%s]:[user_id:%s]:[%s]\n" % (account, user_id, token))
            return token, str(user_id)

        # generate token
        user_id = str(redis_db.incr(CURRENT_USER_ID))
        s = Serializer(app.config['SECRET_KEY'], expires_in=6000)  # 3600000=41 days
        token = s.dumps({'user_id': '%s' % user_id, 'passwd': passwd})

        # save account/passwd to mongodb
        passwd_hash = pwd_context.encrypt(passwd)
        one_user = {'_id': user_id, 'account': account, 'passwd_hash': passwd_hash}
        # user_obj_id = user_db.user_collection.insert_one(one_user).inserted_id
        user_obj_id = user_db.user_collection.insert_one(one_user).inserted_id

        # save token to redis
        redis_db.set(str(user_id), token)
        # save user to easemob platform
        im_obj.register_user(user_id, user_id)

        app.logger.debug("add user [%s]:[%s]:[%s]:%s]" % (account, passwd_hash, token, user_id))
        return token, str(user_id)

    @classmethod
    def register_user(cls, account=None, identify_code=None, passwd=None):
        # username may be phone_num or email
        if identify_code is None:
            identify_code = random.randint(111111, 999999)
            # call API send identify_code to phone num
            if len(account) == 11:  # from app/web/weixin
                msg = u"[做好事]: %d ,请与10分钟内完成手机号验证操作" % identify_code
                send_short_message(account, msg)
            app.logger.debug("Get identify_code:%s for user %s" % (str(identify_code), account))

            # set it to redis {account:identify_code} and set expire time
            redis_db.set(account, identify_code)
            redis_db.expire(account, 600)

            return {'identify_code': str(identify_code)}
        else:
            # get identify_code from redis {account:identify_code}
            saved_identify_code = redis_db.get(account)

            if identify_code == saved_identify_code:
                # delete identify_code from redis {account:identify_code}
                redis_db.delete(account)

                app.logger.debug("Identify success for account %s" % account)
                token, user_obj_id = cls.add_user(account, passwd)
                return {"account": account, "token": token, "user_id": user_obj_id}
            else:
                app.logger.debug("Identify error:%s,code:%s,saved:%s" % (account, identify_code, saved_identify_code))
                return {'error': 'Identify code not match'}

    def del_user(self, user_id):
        app.logger.debug("del_user start:[%s]" % (user_id))

        # delete head portrait from store

        # delete from db
        # user_obj_id = user_db.user_collection.remove(one_user).inserted_id

        # clear redis token
        redis_db.delete(self.user_id)

        # delete his activities in db

        app.logger.debug("del_user [%s:%s]" % (self.user_id, user_id))
        return {'del': user_id}

    @classmethod
    def login(cls, account=None, passwd=None):
        app.logger.debug("Login start:[%s]" % account)
        # get password hash/object_id from mongodb
        result_find = user_collection.find_one({'account': account})
        if result_find is None:
            return {'error': 'login failed'}

        db_passwd_hash = result_find['passwd_hash']
        object_id = result_find['_id']

        try:
            ret = pwd_context.verify(passwd, db_passwd_hash)
            if not ret:
                app.logger.debug("Login failed:[%s]" % account)
                return {'error': 'login failed'}
        except Exception, e:
            app.logger.error("Login failed:[%s]" % account)
            app.logger.error(e)
            return {'error': 'login failed'}
        else:
            # generate token
            s = Serializer(app.config['SECRET_KEY'], expires_in=6000)  # 3600000=41 days
            token = s.dumps({'user_id': '%s' % object_id, 'passwd': passwd})
            # save token to redis
            redis_db.set(str(object_id), token)

            app.logger.debug("Login success:[%s:%s:%s]" % (account, object_id, token))
            return {"login": account, "token": token, "user_id": str(object_id)}

    def logout(self):
            app.logger.debug("Login failed:[%s]" % self.user_id)
            # clear redis token
            redis_db.delete(self.user_id)

            return {'logout': self.user_id}

    def modify_user(self, info, update='modify'):
        app.logger.debug("save user's new info to db:[%s]" % info)
        if update == 'modify':
            """
            for one in info:
                new_info = {one: info[one]}
                if one in ['post', 'friends', 'follower', 'followee']:
                    # result = user_db.user_collection.update({'_id': self.user_id}, {'$addToSet': info})
                    result = user_db.user_collection.update({'_id': self.user_id}, {'$push': new_info})
            """
            token = info.get("token")
            if token:
                try:
                    del info["token"]
                except Exception, e:
                    app.logger.error("del key error:%s", e)

            result = user_db.user_collection.update({'_id': self.user_id}, {'$set': info})
        elif update == 'delete':
            new_info = info
            result = user_db.user_collection.update({'_id': self.user_id}, {'$pull': new_info})

        if result.get('ok') != 1:
            app.logger.error("result is %s" % result)
            return result

        app.logger.debug("modify_user [%s:%s]" % (self.user_id, result))
        return {'modifyok': self.user_id}

    @classmethod
    def users_search(cls, args, fields, offset, limit):
        app.logger.debug("person_nearby:[%s,%s,%s,%s]\n" % (args, fields, offset, limit))
        # may be first create index
        result = user_db.user_collection.ensure_index([("loc", pymongo.GEO2D), ("sex", 1)])

        condition = dict()
        loc_x = int(args.get('loc_x'))
        loc_y = int(args.get('loc_y'))
        loc = []
        loc.append(loc_x)
        loc.append(loc_y)
        app.logger.debug("loc:[%s]\n" % loc)
        if loc is None:
            find_result = user_db.user_collection.find(args).skip(offset).limit(limit)
        else:
            # del args['loc']
            condition['loc'] = {'$near': loc}
            new_cond = dict(condition, **args)
            # find_result = user_db.user_collection.find(condition).skip(offset).limit(limit)
            find_result = user_db.user_collection.find().skip(offset).limit(limit)

        # db.runCommand( { geoNear : "user_collection" , near : [50,50], num : 10 , query:{"age" : 233} });
        result = []
        # maybe only append some meta data, filter with fields
        for one in find_result:
            app.logger.debug("users find result [%s]\n" % one)
            if 'passwd_hash' in one:
                del one['passwd_hash']
            result.append(one)

        app.logger.debug("users_search [%s]\n" % result)
        return {'users': result}

    def add_friend_ask(self, user1, user2=None, msg=None):
        app.logger.debug("add_friend_ask:[%s]" % user1)

        ask_user = self.show_user()
        self.follow_sb(self.user_id, user1)

        # send ask info to him
        msg_body = {}
        msg_body['target_type'] = "users"
        msg_body['target'] = [user1]
        msg_body['msg'] = {"type": "txt", "msg": '%s' % msg}
        msg_body['from'] = self.user_id

        im_obj.send_txt_msg(self.user_id, msg_body)

        app.logger.debug("add_friend_ask [%s:%s]" % (self.user_id, msg))
        return {'add_friend_ask_ok': self.user_id}

    def add_friend_confirm(self, user1, user2=None, msg=None):
        app.logger.debug("add_friend_confirm:[%s]" % user1)

        confirm_user = self.show_user()

        # add follow on redis
        self.follow_sb(self.user_id, user1)

        # add friend on redis
        self.add_friend(self.user_id, user1)

        # add friend on IM platform
        im_obj.add_friend(self.user_id, user1)

        app.logger.debug("add_friend_confirm [%s]" % self.user_id)
        return {'add_friend_ok': self.user_id}

    def add_friend(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (FRIENDS_KEY, from_user)
        ret = redis_db.sadd(forward_key, to_user)

        app.logger.debug("follow:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def del_friend(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (FRIENDS_KEY, from_user)
        ret = redis_db.srem(forward_key, to_user)

        app.logger.debug("un_follow:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def follow_sb(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (FOLLOWS_KEY, from_user)
        forward = redis_db.sadd(forward_key, to_user)
        reverse_key = '%s:%s' % (FOLLOWERS_KEY, to_user)
        reverse = redis_db.sadd(reverse_key, from_user)

        ret = forward and reverse
        app.logger.debug("follow:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def un_follow_sb(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (FOLLOWS_KEY, from_user)
        forward = redis_db.srem(forward_key, to_user)
        reverse_key = '%s:%s' % (FOLLOWERS_KEY, to_user)
        reverse = redis_db.srem(reverse_key, from_user)
        ret = forward and reverse
        app.logger.debug("un_follow:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def block_sb(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (BLOCKS_KEY, from_user)
        forward = redis_db.sadd(forward_key, to_user)
        reverse_key = '%s:%s' % (BLOCKED_KEY, to_user)
        reverse = redis_db.sadd(reverse_key, from_user)
        ret = forward and reverse
        app.logger.debug("block:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def unblock_sb(self, from_user, to_user, msg=None):
        forward_key = '%s:%s' % (BLOCKS_KEY, from_user)
        forward = redis_db.srem(forward_key, to_user)
        reverse_key = '%s:%s' % (BLOCKED_KEY, to_user)
        reverse = redis_db.srem(reverse_key, from_user)
        ret = forward and reverse
        app.logger.debug("unblock:[%s],[%s],[ret:%s]" % (from_user, to_user, ret))
        return ret

    def get_follows(self, user, user2=None, msg=None):
        follows = redis_db.smembers('%s:%s' % (FOLLOWS_KEY, user))
        blocked = redis_db.smembers('%s:%s' % (BLOCKED_KEY, user))

        ret = list(follows.difference(blocked))
        app.logger.debug("get_follows:[%s],[ret:%s]" % (user, ret))
        return ret

    def get_followers(self, user, user2=None, msg=None):
        followers = redis_db.smembers('%s:%s' % (FOLLOWERS_KEY, user))
        blocks = redis_db.smembers('%s:%s' % (BLOCKS_KEY, user))
        ret = list(followers.difference(blocks))
        app.logger.debug("get_followers:[%s],[ret:%s]" % (user, ret))
        return ret

    def get_blocks(self, user, user2=None, msg=None):
        return list(redis_db.smembers('%s:%s' % (BLOCKS_KEY, user)))

    def get_blocked(self, user, user2=None, msg=None):
        return list(redis_db.smembers('%s:%s' % (BLOCKED_KEY, user)))

    def get_friends(self, user, user2=None, msg=None):
        return list(redis_db.smembers('%s:%s' % (FRIENDS_KEY, user)))


class Loster(object):
    def __init__(self):
        pass

