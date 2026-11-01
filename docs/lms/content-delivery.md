# LMS Content Delivery System

This section documents how the application handles content delivery, structured as a modular, template-driven system.

## Page Types
The system uses a modular approach where different content areas are represented by specific components in `src/components/pageType/`. This allows for varied layouts while maintaining a consistent design language.

- **Home Pages**: `HomePage1`, `HomePage2` (Landing experiences)
- **News Section**:
    - `NewsPage1`, `NewsPage2`: List views for multiple news items.
    - `NewsArticlePage1`: Detailed view for a single article.
- **About & Info**:
    - `AboutMePage1`, `AboutMePage3`: Personal/Organizational info.
    - `VolunteerPage1`, `VolunteerPage2`, `VolunteerPage3`: Volunteer-specific content.
    - `DonationPage1`: Contribution information.
    - `PrivacyPage1`: Legal and privacy policies.

## Content Rendering
Content is primarily rendered through a set of reusable article components located in `src/components/article/`:

- **ArticleHeader**: Displays the title and primary metadata.
- **ArticleSummary**: Provides a brief teaser for lists or previews.
- **ArticleContent**: The main body of the content, supporting rich text and media.

## Modular Assembly
Pages are built by composing structural blocks:
- **HeroSection**: Large top banners (e.g., `BannerAboutMe`).
- **Midsection**: Reusable middle blocks (e.g., `AboutSection`, `midsection.tsx`) to segment content.
- **Layout Helpers**: `LeftAlText` and `RightAlPic` for alternating content layouts.
- **Media**: `ImageGallery` and `ImageBanner` for integrated visual content.
