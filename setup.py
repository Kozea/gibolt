#!/usr/bin/env python

import sys

from setuptools import find_packages, setup

# Private
if 'register' in sys.argv or 'upload' in sys.argv:
    print('Private package')
    sys.exit(1)

__version__ = "0.0.1"

tests_requirements = [
    'pytest-runner == 3.0', 'pytest-cov == 2.5.1', 'pytest-flake8 == 0.9.1',
    'pytest-isort == 0.1.0', 'pytest == 3.2.5'
]

setup(
    name="gibolt",
    version=__version__,
    description="Gibolt",
    author="Florian Mounier",
    author_email="florian.mounier@kozea.fr",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "alembic == 0.9.6",
        "CacheControl == 0.12.3",
        "Flask == 0.12.2",
        "GitHub-Flask == 3.2.0",
        "lockfile == 0.12.2",
        "python-dateutil == 2.6.1",
        "pytz == 2017.3",
        "SQLAlchemy == 1.1.15",
        "unrest == 0.6.7"
    ],
    provides=["gibolt"],
    setup_requires=['pytest-runner'],
    test_requires=tests_requirements,
    extras_require={
        'test': tests_requirements
    }
)
