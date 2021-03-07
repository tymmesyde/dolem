<template>
    <div class="header">
        <div class="title" @click="hideWindow()">
            <img src="../assets/img/icon.png" alt="" class="icon">
            dolem
        </div>

        <slot></slot>
    </div>
</template>

<script>
import { Electron } from '../services';

export default {
    name: 'Header',
    methods: {
        hideWindow() {
            Electron.toggleWindow();
        }
    }
}
</script>

<style lang="scss" scoped>
.header {
    z-index: 1;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: $header-height;
    padding: 0 2.75vh;
    font-size: 1.75rem;
    font-family: 'Montserrat-Regular';
    color: $text-color;
    box-shadow: inset 0px 1vh 20px -7px #261A37;

    .title {
        display: flex;
        align-items: center;
        height: 100%;
        cursor: pointer;

        .icon {
            width: 5.5vh;
            margin-right: 2vh;
        }
    }
}
</style>
