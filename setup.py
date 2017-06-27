#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys

from setuptools import setup, find_packages

# Private
if 'register' in sys.argv or 'upload' in sys.argv:
    print('Private package')
    sys.exit(1)

__version__ = "0.0.1"

tests_requirements = [
    'pytest-runner', 'pytest-cov', 'pytest-flake8', 'pytest-isort',
    'pytest'
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
        "Flask>=0.10.0",
        "GitHub-Flask>=3.1.2",
        "CacheControl",
        "lockfile",
        "python-dateutil",
        "pytz"
    ],
    provides=["gibolt"],
    setup_requires=['pytest-runner'],
    test_requires=tests_requirements,
    extras_require={'test': tests_requirements}
)
