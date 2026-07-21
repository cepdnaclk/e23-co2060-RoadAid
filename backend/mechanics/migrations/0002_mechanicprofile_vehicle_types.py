from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mechanics', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mechanicprofile',
            name='vehicle_types',
            field=models.TextField(blank=True, default=''),
        ),
    ]