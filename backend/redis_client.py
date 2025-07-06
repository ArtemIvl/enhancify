import redis

from config import REDIS_HOST, REDIS_PORT

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

for key in r.scan_iter("top_listened_artists:concert_info:*"):
    r.delete(key)
    print("Deleted")