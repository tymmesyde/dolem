<template>
    <div class="toggle" @click="$emit('update:modelValue', !modelValue)">
        <ion-icon name="toggle" v-show="modelValue" class="success"></ion-icon>
        <ion-icon name="toggle-outline" class="flip" v-show="!modelValue"></ion-icon>
    </div>
</template>

<script>
export default {
    name: 'Toggle',
    emits: ['update:modelValue'],
    props: {
        modelValue: Boolean
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