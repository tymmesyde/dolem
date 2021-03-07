<template>
    <div class="status">
        <div v-show="value">
            <ion-icon name="shield-checkmark-outline" class="success"></ion-icon>
            <div>Protected</div>
        </div>

        <div v-show="!value">
            <ion-icon name="close-circle-outline" class="danger"></ion-icon>
            <div>Disabled</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Status',
    props: {
        value: Boolean
    }
}
</script>

<style lang="scss" scoped>
.status {
    position: sticky;
    top: $header-height;
    height: calc(100vh - #{$header-height} - #{$history-title-height});
    display: grid;
    place-items: center;
    font-family: 'Montserrat-SemiBold';
    font-size: 5.5vh;
    color: $text-color;
    text-align: center;

    ion-icon {
        font-size: 25vh;
        --ionicon-stroke-width: 20px;
    }
}
</style>