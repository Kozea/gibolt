from setuptools import setup, find_packages

setup(
    name='gibolt',
    version='0.1.dev0',
    description='github for Hussan bolt',
    url='https://github.com/Kozea/gibolt',
    author='Kozea',
    packages=find_packages(),
    install_requires=[
        'Flask',
        'GitHub-Flask>=3.1.2',
        'CacheControl',
        'python-dateutil',
        'pytz'],
)
