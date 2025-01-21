from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, User
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings  # Import settings to access AUTH_USER_MODEL


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        username = self.model.normalize_username(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True, null=True)
    email = models.EmailField(blank=True, null=True, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    conversation_history = models.JSONField(default=dict, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'  # Set username as the login field
    REQUIRED_FIELDS = []  # Fields required when creating a superuser (besides username and password)

    def __str__(self):
        return self.username

    # Add the required method
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.username

    def get_full_name(self):
        """Return the full name for the user."""
        return f"{self.first_name} {self.last_name}".strip() or self.username


class Feedback(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Use the custom user model
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    prompt = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user if self.user else 'N/A'} at {self.timestamp}"


# Model for later used RLHF Data - gathered from user's detailed feedback with LLM's interaction

class RLHFFeedback(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text="User providing the feedback. Null for anonymous."
    )
    prompt = models.TextField(help_text="The user prompt for which the response was given.")
    response = models.TextField(help_text="The LLM response being evaluated.")

    # Rating dimensions
    completeness_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for completeness (1-5)."
    )
    completeness_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for completeness rating."
    )
    accuracy_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for accuracy (1-5)."
    )
    accuracy_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for accuracy rating."
    )
    instruction_following_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for instruction following (1-5)."
    )
    instruction_following_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for instruction following rating."
    )
    contextual_awareness_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for contextual awareness (1-5)."
    )
    contextual_awareness_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for contextual awareness rating."
    )
    writing_quality_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for writing quality (1-5)."
    )
    writing_quality_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for writing quality rating."
    )
    creativity_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating for creativity (1-5)."
    )
    creativity_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for creativity rating."
    )
    final_score = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Overall final score for the response (1-5)."
    )
    final_score_justification = models.TextField(
        null=True, blank=True,
        help_text="Optional justification for the final score."
    )

    timestamp = models.DateTimeField(auto_now_add=True, help_text="Time when feedback was submitted.")

    def __str__(self):
        return f"RLHF Feedback by {self.user if self.user else 'Anonymous'} on {self.timestamp}"

