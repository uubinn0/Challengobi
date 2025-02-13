# Generated by Django 5.1.5 on 2025-02-12 06:09

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Challenge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.PositiveSmallIntegerField(choices=[(1, '카페/디저트'), (2, '외식'), (3, '장보기'), (4, '쇼핑'), (5, '문화생활'), (6, '취미/여가'), (7, '술/담배'), (8, '교통'), (9, '기타')])),
                ('title', models.CharField(max_length=60)),
                ('description', models.CharField(max_length=85, null=True)),
                ('start_date', models.DateField()),
                ('duration', models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(7), django.core.validators.MaxValueValidator(28)])),
                ('end_date', models.DateField()),
                ('visibility', models.BooleanField(default=False)),
                ('max_participants', models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(100)])),
                ('budget', models.PositiveIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.PositiveSmallIntegerField(choices=[(0, 'RECRUIT'), (1, 'IN_PROGRESS'), (2, 'COMPLETED'), (3, 'DELETED')], default=0)),
                ('progress_rate', models.FloatField(default=0)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'Challenge',
            },
        ),
        migrations.CreateModel(
            name='ChallengeInvite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='challenges.challenge')),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_invites', to=settings.AUTH_USER_MODEL)),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_invites', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ChallengeInvite',
            },
        ),
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('store', models.CharField(max_length=255)),
                ('amount', models.PositiveIntegerField()),
                ('payment_date', models.DateTimeField()),
                ('is_handwritten', models.BooleanField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='challenges.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'Expense',
            },
        ),
        migrations.CreateModel(
            name='ChallengeLike',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('encourage', models.BooleanField(default=False)),
                ('want_to_join', models.BooleanField(default=False)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='challenges.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ChallengeLike',
                'unique_together': {('challenge', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ChallengeParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ocr_count', models.PositiveSmallIntegerField(default=0)),
                ('initial_budget', models.IntegerField()),
                ('balance', models.IntegerField()),
                ('is_failed', models.BooleanField(null=True)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='challenges.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ChallengeParticipant',
                'unique_together': {('challenge', 'user')},
            },
        ),
    ]
