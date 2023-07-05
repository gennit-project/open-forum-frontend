import { ONLINE_EVENT_LIST } from "./constants";
import { deleteAll, seedAll } from "./utils";
import { eventsForFilteringTests } from "./testData/eventsForFilteringTests";

describe("Filter events by text", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
    cy.createEvents(eventsForFilteringTests);
  });

  it("in the sitewide online events list, filters events by text", () => {
    const searchTerm = "virtual";

    cy.visit(ONLINE_EVENT_LIST);
    cy.get('div[data-testid="event-filter-search-bar"]')
      .find("input")
      .type(`${searchTerm}{enter}`);

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]').find("li").contains(searchTerm);
  });

  it("in a channel view, filters events by text", () => {
    const CHANNEL_VIEW = "http://localhost:5173/channels/c/phx_music/events/search/"
    const searchTerm = "trivia";

    cy.visit(CHANNEL_VIEW);
    cy.get('div[data-testid="event-filter-search-bar"]')
      .find("input")
      .type(`${searchTerm}{enter}`);

    // should have one result
    cy.get('ul[data-testid="event-list"]').find("li").should("have.length", 1);

    // top result contains the search term
    cy.get('ul[data-testid="event-list"]').find("li").contains(searchTerm);
  });
});
