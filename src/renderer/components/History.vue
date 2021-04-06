<template>
    <div class="history" ref="history">
        <div class="title" @click="scrollToBottom()">
            <ion-icon name="receipt-outline"></ion-icon>
            History
        </div>

        <div class="placeholder" v-if="isEmpty">
            <ion-icon name="alert-circle-outline"></ion-icon>
            No records
        </div>

        <div class="content" v-else>
            <div class="list">
                <div class="item" v-for="[hostname, hits] in sortedHistory" :key="hostname">
                    <div class="hostname">
                        {{ hostname }}
                    </div>
                    <div class="hits">
                        {{ hits > 99 ? hits + '+' : hits }}
                    </div>
                </div>
            </div>

            <Button icon="trash" @click="clear()">
                CLEAR
            </Button>
        </div>
    </div>
</template>

<script>
import { Shield } from '../services';
import Button from './Button';

export default {
    name: 'History',
    components: {
        Button
    },
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
        },
        clear() {
            this.history = {};
            this.store();
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
    padding: 0 20px;
    padding-bottom: 15px;
    background-color: $accent-color;
    font-family: 'Montserrat-SemiBold';
    color: transparent;
    box-shadow: 0 0 1vh rgba(0, 0, 0, 0.1);
    overflow-x: hidden;

    .title {
        width: 100%;
        display: flex;
        gap: 12px;
        z-index: 1;
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        height: $history-title-height;
        margin: 0;
        background-color: $accent-color;
        font-size: 20px;
        color: $text-color;
        cursor: pointer;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: calc(100% - #{$history-title-height});
        font-family: 'Montserrat-Regular';
        color: $text-color;
        opacity: 0.5;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;

        .list {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 10px;

            .item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 12px;
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
                    height: 20px;
                    padding: 0 7px;
                    border-radius: 10px;
                    background-color: $warning-color;
                    color: $text-color;
                    font-size: 11px;
                    user-select: none;
                }
            }
        }
    }
}
</style>