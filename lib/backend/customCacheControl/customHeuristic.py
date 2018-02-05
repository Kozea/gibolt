import calendar
from datetime import datetime, timedelta
from email.utils import formatdate, parsedate

from cachecontrol.heuristics import BaseHeuristic


class ZeroSecondsHeuristic(BaseHeuristic):
    # allows to define a specific cache freshness validity (in this case 0 sec)
    #
    # based on an example from CacheControl documentation (v0.12.3)
    # http://cachecontrol.readthedocs.io/en/latest/custom_heuristics.html#caching-heuristics
    def update_headers(self, response):
        date = parsedate(response.headers['date'])
        expires = datetime(*date[:6]) + timedelta(seconds=0)
        return {
            'expires': formatdate(calendar.timegm(expires.timetuple())),
            'cache-control': 'public',
        }

    def warning(self, response):
        msg = 'Automatically cached! Response is Stale.'
        return '110 - "%s"' % msg
