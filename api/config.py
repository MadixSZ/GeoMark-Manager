import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = 'dev-key-segura'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(
        basedir, '..', 'data', 'database.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False