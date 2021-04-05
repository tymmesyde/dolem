<template>
    <ul class="history" ref="history">
        <h3 @click="scrollToBottom()">
            <ion-icon name="receipt-outline"></ion-icon>
            History
        </h3>

        <li v-for="[hostname, hits] in sortedHistory" :key="hostname">
            <div class="hostname">
                {{ hostname }}
            </div>
            <div class="hits">
                {{ hits > 99 ? hits + '+' : hits }}
            </div>
        </li>

        <div class="empty" v-show="isEmpty">
            <ion-icon name="alert-circle-outline"></ion-icon>
            No records
        </div>
    </ul>
</template>

<script>
import { Shield } from '../services';

export default {
    name: 'History',
    data() {
        return {
            history: {},
            storeTimeout: null
        }
    },
    computed: {
        isEmpty() {
            return !Object.keys(this.history).length;
        },
        sortedHistory() {
            return Object.entries(this.history).sort((a, b) => b[1] - a[1]);
        }
    },
    methods: {
        scrollToBottom() {
            this.$scrollTo(this.$refs.history, 500);
        },
        handleBlockedEvent(hostname) {
            if (this.history[hostname]) this.history[hostname]++;
            else this.history[hostname] = 1;
        },
        store() {
            clearTimeout(this.storeTimeout);
            this.storeTimeout = setTimeout(() => localStorage.setItem('history', JSON.stringify(this.history)), 1000);
        }
    },
    mounted() {
        const storedHistory = localStorage.getItem('history');
        if (storedHistory) this.history = JSON.parse(storedHistory);

        Shield.onBlocked(({ hostname }) => {
			this.handleBlockedEvent(hostname);
            this.store();
		});
    }
}
</script>

<style lang="scss" scoped>
.history {
    position: relative;
    height: calc(100vh - #{$header-height});
    padding: 0 3.5vh;
    padding-bottom: 3vh;
    background-color: $accent-color;
    font-family: 'Montserrat-SemiBold';
    color: transparent;
    box-shadow: 0 0 1vh rgba(0, 0, 0, 0.1);
    overflow-x: hidden;

    h3 {
        z-index: 1;
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        height: $history-title-height;
        margin: 0;
        background-color: $accent-color;
        color: $text-color;
        cursor: pointer;

        ion-icon {
            margin-right: 2vh;
        }
    }

    li {
        display: flex;
        justify-content: space-between;
        padding: 0.5vh 0;
        font-size: 0.75rem;
        color: $text-color;

        .hostname {
            opacity: 0.6;
            user-select: text;
            transition: opacity 0.15s ease-in-out;

            &:hover {
                opacity: 0.7;
            }
        }

        .hits {
            display: grid;
            place-items: center;
            height: 3.5vh;
            min-width: 3.5vh;
            padding: 0 1.15vh;
            border-radius: 1.5vh;
            background-color: $warning-color;
            color: $text-color;
            font-size: 2vh;
            user-select: none;
        }
    }

    .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100% - #{$history-title-height});
        font-family: 'Montserrat-Regular';
        color: $text-color;
        opacity: 0.5;

        ion-icon {
            margin-right: 1vh;
        }
    }
}
</style>