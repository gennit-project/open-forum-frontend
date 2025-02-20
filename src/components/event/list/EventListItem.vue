<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useRoute } from "vue-router";
import { Event } from "@/__generated__/graphql";
import { getDatePieces } from "@/utils/dateTimeUtils";
import Tag from "@/components/generic/Tag.vue";
import HighlightedSearchTerms from "../../generic/HighlightedSearchTerms.vue";
import { DateTime } from "luxon";
import { SearchEventValues } from "@/types/eventTypes";
import { router } from "@/router";
import MenuButton from "@/components/generic/buttons/MenuButton.vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";
import MarkdownPreview from "@/components/generic/MarkdownPreview.vue";
import { useDisplay } from "vuetify";

export default defineComponent({
  components: {
    ChevronDownIcon,
    Tag,
    HighlightedSearchTerms,
    MarkdownPreview,
    MenuButton,
  },
  props: {
    event: {
      type: Object as PropType<Event>,
      required: true,
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    currentChannelId: {
      type: String,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    showMap: {
      type: Boolean,
      required: true,
    },
    showDetailLink: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const { timeOfDay, weekday, month, day, year } =
      getDatePieces(startTimeObj);

    const now = DateTime.now();
    const currentYear = now.year;

    const formattedDate = `${weekday}, ${month} ${day}${
      year !== currentYear ? ", " + year : ""
    }`;

    const eventIdInParams = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const defaultUniqueName = computed(() => {
      if (props.currentChannelId) {
        return props.currentChannelId;
      }
      if (props.event.EventChannels.length > 0) {
        const channelUniqueName =
          props.event.EventChannels[0].channelUniqueName;
        if (typeof channelUniqueName === "string") {
          return channelUniqueName;
        }
      }
      return "";
    });

    const detailLink = computed(() => {
      if (!defaultUniqueName.value) {
        return "";
      }
      return router.resolve({
        name: "EventDetail",
        params: {
          channelId: defaultUniqueName.value,
          eventId: props.event.id,
        },
      }).href;
    });

    const submittedToMultipleChannels = computed(() => {
      return props.event.EventChannels.length > 1;
    });

    const eventDetailOptions = computed(() => {
      if (!props.event) {
        return [];
      }
      return props.event.EventChannels.map((dc) => {
        const commentCount = dc.CommentsAggregate?.count || 0;
        return {
          label: `${commentCount} ${
            commentCount === 1 ? "comment" : "comments"
          } in ${dc.channelUniqueName}`,
          value: router.resolve({
            name: "DiscussionDetail",
            params: {
              discussionId: props.event?.id,
              channelId: dc.channelUniqueName,
            },
          }).href,
          event: "",
        };
      }).sort((a, b) => {
        return b.label.localeCompare(a.label);
      });
    });

    const commentCount = computed(() => {
      let count = 0;
      if (props.event) {
        return props.event.CommentsAggregate?.count;
      }
      return count;
    });

    const channelCount = computed(() => {
      if (props.event) {
        const discussionChannels = props.event.EventChannels;
        if (discussionChannels) {
          return discussionChannels.length;
        }
      }
      return 0;
    });

    const truncatedDescription = computed(() => {
      if (!props.event.description) {
        return "";
      }

      if (props.event.description.length > 200) {
        return props.event.description.slice(0, 500) + "...";
      }
      return props.event.description;
    });

    return {
      commentCount,
      channelCount,
      defaultUniqueName,
      eventDetailOptions,
      eventIdInParams,
      formattedDate,
      route,
      timeOfDay,
      truncatedDescription,
      detailLink,
      submittedToMultipleChannels,
    };
  },
  data(props) {
    const { smAndDown } = useDisplay();
    return {
      previewIsOpen: false,
      isWithinChannel: props.currentChannelId ? true : false,
      smAndDown,
    };
  },
  computed: {
    selectedTagsMap() {
      let obj: any = {};
      for (let i = 0; i < this.selectedTags.length; i++) {
        const tag = this.selectedTags[i];
        obj[tag] = true;
      }
      return obj;
    },
    previewLink() {
      if (!this.event) {
        return "";
      }
      if (
        this.$route.name === "MapView" ||
        this.$route.name === "MapEventPreview"
      ) {
        return `/map/search/${this.event.id}`;
      }
      if (this.$route.name === "SitewideSearchEventPreview") {
        return `/events/list/search/${this.event.id}`;
      }
      if (this.$route.name === "SearchEventsInChannel") {
        return `/channels/c/${this.currentChannelId}/events/`;
      }
      return ``;
    },
  },
  methods: {
    // getCommentCount(commentSection: CommentSectionData) {
    //   const count = commentSection.CommentsAggregate.count;
    //   return ` ${count} comment${count === 1 ? "" : "s"}`;
    // },
    // getChannel(commentSection: CommentSectionData) {
    //   return commentSection.Channel.uniqueName;
    // },
    handleClickTag(tagText: string) {
      const currentQuery = this.$route.query;

      if (currentQuery.tags) {
        if (
          typeof currentQuery.tags === "string" &&
          tagText === currentQuery.tags
        ) {
          // If we're already filtering by the tag, clear it.
          const newQuery = { ...this.$route.query };
          delete newQuery["tags"];

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else if (
          typeof currentQuery.tags === "object" &&
          currentQuery.tags.includes(tagText)
        ) {
          // If we're already filtering by multiple tags including this tag,
          // remove only this tag.
          const newQuery = { ...this.$route.query };
          newQuery.tags = newQuery.tags.filter((tag: string) => {
            return tag !== tagText;
          });

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else {
          // If we are not already filtering by the tag,
          // overwrite existing tag filters with it.
          this.updateFilters({ tags: [tagText] });
        }
      } else {
        this.updateFilters({ tags: [tagText] });
      }
    },
    handleClickChannel(uniqueName: string) {
      const currentQuery = this.$route.query;

      if (currentQuery.channels) {
        if (
          typeof currentQuery.channels === "string" &&
          uniqueName === currentQuery.channels
        ) {
          // If we're already filtering by the channel, clear it.
          const newQuery = { ...this.$route.query };
          delete newQuery["channels"];

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else if (
          typeof currentQuery.channels === "object" &&
          currentQuery.channels.includes(uniqueName)
        ) {
          // If we're already filtering by multiple channels including this channel,
          // remove only this channel.
          const newQuery = { ...this.$route.query };
          newQuery.channels = newQuery.channels.filter((channel: string) => {
            return channel !== uniqueName;
          });

          this.$router.replace({
            query: {
              ...newQuery,
            },
          });
        } else {
          // If we are not already filtering by the channel,
          // overwrite existing channel filters with it.
          this.updateFilters({ channels: [uniqueName] });
        }
      } else {
        this.updateFilters({ channels: [uniqueName] });
      }
    },
    getDetailLink(uniqueName: string) {
      return router.resolve({
        name: "EventDetail",
        params: {
          channelId: uniqueName,
          eventId: this.event.id,
        },
      }).href;
    },
    updateFilters(params: SearchEventValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
    handleClick() {
      if (
        this.smAndDown ||
        this.currentChannelId ||
        this.$route.name === "SearchEventsList"
      ) {
        this.$router.push(this.detailLink);
      } else {
        this.$emit("openPreview");
      }
    },
  },
});
</script>

<template>
  <li
    :ref="`#${event.id}`"
    class="relative pt-4 pr-4 dark:bg-gray-800 list-none"
    :data-testid="`event-list-item-${event.title}`"
    @click="handleClick"
  >
    <div class="flex w-full">
      <div class="flex-shrink-0 rounded-lg">
        <div class="flex h-16 w-16 flex-col items-center justify-center">
          <div
            class="font-semibold text-xs uppercase text-gray-500 dark:text-gray-200"
          >
            {{
              new Date(event.startTime).toLocaleString("en-US", {
                weekday: "short",
              })
            }}
          </div>
          <div class="text-2xl font-bold">
            {{ new Date(event.startTime).getDate() }}
          </div>
          <div
            class="font-semibold text-xs lowercase text-gray-500 dark:text-gray-200"
          >
            {{
              new Date(event.startTime).toLocaleString("en-US", {
                month: "short",
              })
            }}
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <img
          v-if="smAndDown && event.coverImageURL"
          :src="event.coverImageURL"
          alt="Event cover image"
          class="mb-4 max-h-48 rounded-lg"
        >
        <div>
          <span
            class="text-md flex-wrap cursor-pointer font-bold text-blue-500 hover:underline"
          >
            <HighlightedSearchTerms
              :text="event.title"
              :search-input="searchInput"
            />
          </span>

          <span
            v-if="event.canceled"
            class="rounded-lg bg-red-100 px-3 ml-2 py-1 text-sm text-red-500 dark:bg-red-500 dark:text-white"
          >Canceled</span>
        </div>

        <div class="flex gap-1 flex-wrap">
          <span
            class="mt-2 flex flex-wrap text-sm text-gray-500 dark:text-gray-200"
          >
            {{
              `${event.locationName || ""}${event.locationName ? " at " : ""}${timeOfDay}`
            }}
          </span>
        </div>
        <p v-if="event.virtualEventUrl">
          Online event
        </p>
        <p
          v-if="event.free"
          class="text-sm font-medium text-gray-600"
        >
          Free
        </p>

        <div
          v-if="truncatedDescription"
          class="my-2 max-w-lg border-l-2 border-gray-400"
        >
          <MarkdownPreview
            :text="truncatedDescription || ''"
            :disable-gallery="true"
            :word-limit="20"
            class="ml-2"
          />
        </div>
        <p
          class="mt-1 flex space-x-1 text-sm font-medium text-gray-600 hover:no-underline"
        >
          <Tag
            v-for="tag in event.Tags"
            :key="tag"
            class="my-1"
            :active="selectedTags.includes(tag.text)"
            :tag="tag.text"
            @click="
              () => {
                handleClickTag(tag.text);
              }
            "
          />
        </p>

        <router-link
          v-if="
            showDetailLink &&
              event &&
              (isWithinChannel || !submittedToMultipleChannels)
          "
          :to="getDetailLink(event.EventChannels[0].channelUniqueName)"
          class="flex cursor-pointer items-center justify-start gap-1 text-gray-500 dark:text-gray-100"
        >
          <button
            class="rounded-md bg-gray-100 px-4 pt-1 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            <i class="fa-regular fa-comment mt-1 h-6 w-6" />
            <span>{{
              `View ${commentCount} ${
                commentCount === 1 ? "comment" : "comments"
              }`
            }}</span>
            <span v-if="!isWithinChannel">{{
              ` in c/${event.EventChannels[0].channelUniqueName}`
            }}</span>
          </button>
        </router-link>

        <MenuButton
          v-else-if="showDetailLink && event"
          :items="eventDetailOptions"
        >
          <button
            class="-ml-1 flex items-center rounded-md bg-gray-100 px-4 pb-2 pt-2 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            <i class="fa-regular fa-comment mr-2 h-4 w-4" />
            {{
              `${commentCount} ${
                commentCount === 1 ? "comment" : "comments"
              } in ${channelCount} ${
                channelCount === 1 ? "channel" : "channels"
              }`
            }}
            <ChevronDownIcon
              class="-mr-1 ml-2 h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </MenuButton>
      </div>

      <div
        v-if="!smAndDown"
        class="flex-shrink-0 items-center justify-center rounded-lg"
      >
        <img
          v-if="event.coverImageURL"
          :src="event.coverImageURL"
          class="h-32 w-32 rounded-lg"
        >
      </div>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
