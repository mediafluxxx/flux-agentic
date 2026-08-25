from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import date

class GrantOpportunity(BaseModel):
    grant_id: str = Field(description="Unique fingerprint or state-provided ID")
    title: str = Field(description="Title of the grant opportunity")
    state: str = Field(description="Two-letter state code, e.g., 'CA', 'TX'")
    agency: str = Field(description="Issuing Agency Name, e.g., 'CDFA'")
    source_url: HttpUrl = Field(description="Direct URL to the grant detail page")
    description: Optional[str] = None
    funding_amount_max: Optional[float] = None
    open_date: Optional[date] = None
    close_date: Optional[date] = None
    eligible_entities: List[str] = []
    status: str = Field(default="Unknown", description="Open, Closed, Archived, Forecasted")

import hashlib
import asyncio
from abc import ABC, abstractmethod
from typing import List
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page
from schemas import GrantOpportunity

class BaseStateAgScraper(ABC):
    state_code: str = ""
    agency_name: str = ""
    start_url: str = ""

    def generate_grant_id(self, url: str, title: str) -> str:
        """Generates a deterministic ID for deduplication across scraping runs."""
        raw_string = f"{self.state_code}_{url}_{title}".lower()
        return hashlib.sha256(raw_string.encode('utf-8')).hexdigest()[:16]

    async def fetch_page_html(self, page: Page, url: str, wait_selector: str = None) -> str:
        """Navigates to URL using Playwright and waits for dynamic content to render."""
        await page.goto(url, wait_until="networkidle", timeout=30000)
        if wait_selector:
            await page.wait_for_selector(wait_selector, timeout=10000)
        return await page.content()

    @abstractmethod
    async def parse_grants(self, page: Page) -> List[GrantOpportunity]:
        """State-specific logic for extracting grant items."""
        pass

    async def run(self) -> List[GrantOpportunity]:
        """Main execution flow for a state scraper instance."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="AgGrantPortalBot/1.0 (+https://yourdomain.com/bot-info)"
            )
            page = await context.new_page()
            
            try:
                grants = await self.parse_grants(page)
                return grants
            finally:
                await browser.close()


import re
from typing import List
from bs4 import BeautifulSoup
from playwright.async_api import Page
from base_scraper import BaseStateAgScraper
from schemas import GrantOpportunity

class CDFAScraper(BaseStateAgScraper):
    state_code = "CA"
    agency_name = "California Department of Food and Agriculture"
    start_url = "https://www.cdfa.ca.gov/grants/"

    async def parse_grants(self, page: Page) -> List[GrantOpportunity]:
        grants = []
        html = await self.fetch_page_html(page, self.start_url)
        soup = BeautifulSoup(html, "html.parser")

        # CDFA lists grants in structured lists/divs
        grant_cards = soup.select("ul.grant-list > li, div.grant-item, #main-content p")

        for card in grant_cards:
            link_tag = card.find("a")
            if not link_tag or not link_tag.get("href"):
                continue

            title = link_tag.get_text(strip=True)
            if len(title) < 5 or "archive" in title.lower():
                continue

            href = link_tag["href"]
            source_url = href if href.startswith("http") else f"https://www.cdfa.ca.gov{href}"
            
            # Simple heuristic parsing for description
            desc_text = card.get_text(separator=" ", strip=True)

            grant_item = GrantOpportunity(
                grant_id=self.generate_grant_id(source_url, title),
                title=title,
                state=self.state_code,
                agency=self.agency_name,
                source_url=source_url,
                description=desc_text[:500] if desc_text else None,
                status="Open"
            )
            grants.append(grant_item)

        return grants

import asyncio
import json
from cdfa_scraper import CDFAScraper

async def main():
    scrapers = [
        CDFAScraper(),
        # Add additional state scrapers here: TexasAgScraper(), FloridaAgScraper()
    ]

    all_grants = []
    for scraper in scrapers:
        print(f"Scraping {scraper.state_code} - {scraper.agency_name}...")
        try:
            results = await scraper.run()
            all_grants.extend(results)
            print(f"Successfully fetched {len(results)} grants from {scraper.state_code}.")
        except Exception as e:
            print(f"Error scraping {scraper.state_code}: {e}")

    # Output normalized JSON dump
    output_json = [grant.model_dump(mode='json') for grant in all_grants]
    print(json.dumps(output_json, indent=2))

if __name__ == "__main__":
    asyncio.run(main())