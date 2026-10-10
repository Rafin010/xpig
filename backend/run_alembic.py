import alembic.config
import sys

alembicArgs = [
    '--raiseerr',
    'upgrade', 'head',
]
alembic.config.main(argv=alembicArgs)
