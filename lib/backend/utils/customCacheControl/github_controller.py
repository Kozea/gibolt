from cachecontrol.controller import CacheController


class GitHubController(CacheController):
    def update_cached_response(self, request, response):
        """On a 304 we will get a new set of headers that we want to
        update our cached value with, assuming we have one.

        This should only ever be called when we've sent an ETag and
        gotten a 304 as the response.
        """
        cache_url = self.cache_url(request.url)

        cached_response = self.serializer.loads(
            request, self.cache.get(cache_url)
        )

        if not cached_response:
            # we didn't have a cached response
            return response

        # Lets update our headers with the headers from the new request:
        # http://tools.ietf.org/html/draft-ietf-httpbis-p4-conditional-26#section-4.1
        #
        # The server isn't supposed to send headers that would make
        # the cached body invalid. But... just in case, we'll be sure
        # to strip out ones we know that might be problmatic due to
        # typical assumptions.
        # the big change is here as flask_github check for content_type we want
        # to keep the original content-type
        excluded_headers = ['content-length', 'content-type']

        cached_response.headers.update(
            dict(
                (k, v)
                for k, v in response.headers.items()
                if k.lower() not in excluded_headers
            )
        )

        # we want a 200 b/c we have content via the cache
        cached_response.status = 200

        # update our cache
        self.cache.set(
            cache_url, self.serializer.dumps(request, cached_response)
        )

        return cached_response
