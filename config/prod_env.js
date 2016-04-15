/**
 * Created by impyeong-gang on 12/7/15.
 */
module.exports = {
    server: {
        /* https option
        certificate : null,
        key : null,
        */
        name: 'picup-restful-api',
        version: ["0.0.1"]
    },

    GCM: {
        ACCESS_KEY: 'AIzaSyDrWrbQ-RzMZYr1o_lYIUpQn99OtXmZx90'
    },


    DB: {
        MYSQL: {
            HOST: 'bigfrfog-picup.cpcmirt0kyjt.ap-northeast-2.rds.amazonaws.com',
            DATABASE: 'picup',
            PROTOCOL: 'mysql',
            PORT: 3306,
            USERNAME: 'muzzynine',
            PASSWORD: 'su1c1delog1c'
        }
    },

    AMQP : {
        amqpAddr: "amqp://54.178.171.194:5672",

        QUEUE : {
            name : "picup-notification-gcm-1"
        }
    }
};
