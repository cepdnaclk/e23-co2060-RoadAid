from django.db import models
from django.conf import settings


class ServiceRequest(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )

    PROBLEM_TYPE_CHOICES = (
        ('tyre_puncture', 'Tyre Puncture'),
        ('battery_dead', 'Battery Dead'),
        ('engine_overheat', 'Engine Overheat'),
        ('fuel_empty', 'Fuel Empty'),
        ('brake_issue', 'Brake Issue'),
        ('accident', 'Accident'),
        ('towing', 'Need Towing'),
        ('locked_out', 'Locked Out'),
        ('starting_trouble', 'Starting Trouble'),
        ('oil_leak', 'Oil Leak'),
        ('other', 'Other'),
    )

    VEHICLE_TYPE_CHOICES = (
        ('car', 'Car'),
        ('van', 'Van'),
        ('bike', 'Bike'),
        ('three_wheeler', 'Three Wheeler'),
        ('bus', 'Bus'),
        ('lorry', 'Lorry'),
        ('other', 'Other'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_requests'
    )

    mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mechanic_requests'
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    problem_type = models.CharField(
        max_length=50,
        choices=PROBLEM_TYPE_CHOICES,
        default='tyre_puncture'
    )

    custom_problem = models.CharField(
        max_length=255,
        blank=True,
        default=''
    )

    vehicle_type = models.CharField(
        max_length=50,
        choices=VEHICLE_TYPE_CHOICES,
        default='car'
    )

    description = models.TextField(blank=True, default='')

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    review_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Request {self.id} - {self.status}"