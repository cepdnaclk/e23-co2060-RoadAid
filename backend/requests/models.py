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

    description = models.TextField()

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
