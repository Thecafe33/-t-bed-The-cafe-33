"""Shared user actions for the compact, opt-in map search."""
def fill_map_search(page,value):
 if not page.locator('#map-search').is_visible():page.locator('#toggle-map-search').click()
 page.locator('#map-search').fill(value)
