<template>
    <div class="toggle" @click="$emit('input', !value)">
        <ion-icon name="toggle" v-show="value" class="success"></ion-icon>
        <ion-icon name="toggle-outline" class="flip" v-show="!value"></ion-icon>
    </div>
</template>

<script>
export default {
    name: 'Toggle',
    props: {
        value: Boolean
    }
}
</script>

<style lang="scss" scoped>
.toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: $text-color;

    ion-icon {
        font-size: 2.4rem;
        --ionicon-stroke-width: 25px;
    }

    .flip {
        transform: scaleX(-1);
    }
}
</style>