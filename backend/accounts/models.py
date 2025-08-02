from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('USER', 'User'),
        ('GROUP_HEAD', 'Group Head'),
        ('MASTER', 'Master'),
        ('SMU', 'SMU'),
    )
    email = models.EmailField(unique=True, db_column='email')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER', db_column='role')

    class Meta:
        db_table = 'users'