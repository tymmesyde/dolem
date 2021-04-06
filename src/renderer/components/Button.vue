<template>
    <button>
        <ion-icon :name="icon"></ion-icon>
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        icon: String
    }
}
</script>

<style lang="scss" scoped>
button {
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: transparent;
    border: 2px solid $text-color;
    border-radius: 35px;
    padding-left: 13px;
    padding-right: 17px;
    font-family: 'Montserrat-Bold';
    font-size: 14px;
    color: $text-color;
    outline: none;
    transition: all 0.1s ease-in-out;
    cursor: pointer;

    &:hover {
        background-color: $text-color;
        color: $background-color;
    }
}
</style>