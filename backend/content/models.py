from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel
from wagtail.api import APIField

class ArticlePage(Page):
    subtitle = models.CharField(max_length=255, blank=True)
    body = RichTextField(blank=True)
    video_url = models.URLField(blank=True, help_text="YouTube or Vimeo link for associated video lecture")
    is_premium = models.BooleanField(default=False, help_text="Checked items require marketplace purchase")

    # Exposed via the /api/v2/pages/ endpoint
    api_fields = [
        APIField('subtitle'),
        APIField('body'),
        APIField('video_url'),
        APIField('is_premium'),
    ]

    content_panels = Page.content_panels + [
        FieldPanel('subtitle'),
        FieldPanel('body'),
        FieldPanel('video_url'),
        FieldPanel('is_premium'),
    ]
