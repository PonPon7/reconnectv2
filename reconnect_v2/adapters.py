# Adapters used for 3rd party login

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from landing_page.models import CustomUser
from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        Override save_user to ensure proper handling of missing username
        and additional debug information during user creation.
        """
        print("DEBUG: Saving user...")
        user = super().save_user(request, user, form, commit=False)

        # Ensure username is set if missing
        if not user.username:
            user.username = user.email.split('@')[0]  # Generate username from email

        # Optional: Print additional debug info
        print(f"DEBUG: User data before save: username={user.username}, email={user.email}")

        if commit:
            user.save()
        return user


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Triggered before the social login flow is completed.
        Handle cases like duplicate emails or custom field mappings.
        """
        print("DEBUG: Pre-social login triggered...")
        extra_data = sociallogin.account.extra_data
        print(f"DEBUG: Received extra data: {extra_data}")

        # Check for duplicate email
        user_email = extra_data.get('email')
        if user_email:
            try:
                existing_user = CustomUser.objects.get(email=user_email)
                print(f"DEBUG: Found existing user: {existing_user}")
                sociallogin.connect(request, existing_user)
            except CustomUser.DoesNotExist:
                print("DEBUG: No existing user with this email, continuing signup.")

    def save_user(self, request, sociallogin, form=None):
        """
        Save the user with additional field mapping from the social account.
        """
        user = super().save_user(request, sociallogin, form)
        extra_data = sociallogin.account.extra_data

        # Map additional fields
        user.first_name = extra_data.get('given_name', '')
        user.last_name = extra_data.get('family_name', '')

        # Optional: Log mapping
        print(f"DEBUG: User field mapping: first_name={user.first_name}, last_name={user.last_name}")

        user.save()
        return user
