# example for a SQLite recipe for JSON support
# https://bitbucket.org/zzzeek/sqlalchemy/issues/3850/request-sqlite-json1-ext-support
import json

from sqlalchemy import String, TypeDecorator, func
from sqlalchemy.types import NullType


class SQLiteJson(TypeDecorator):
    impl = String

    class Comparator(String.Comparator):
        def __getitem__(self, index):
            if isinstance(index, tuple):
                index = "$%s" % (
                    "".join(
                        [
                            "[%s]" % elem
                            if isinstance(elem, int)
                            else '."%s"' % elem
                            for elem in index
                        ]
                    )
                )
            elif isinstance(index, int):
                index = "$[%s]" % index
            else:
                index = '$."%s"' % index

            # json_extract does not appear to return JSON sub-elements
            # which is weird.
            return func.json_extract(self.expr, index, type_=NullType)

    comparator_factory = Comparator

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value
