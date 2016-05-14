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
            HOST: 'picup.cluster-cqm2majqgqx4.ap-northeast-1.rds.amazonaws.com',
            DATABASE: 'picup',
            PROTOCOL: 'mysql',
            PORT: 3306,
            USERNAME: 'muzzynine',
            PASSWORD: 'su1c1delog1c'
        }
    },

    AWS : {
	region : 'ap-northeast-1'
    },


    MQ : {
	awsConfig : {
	    region : 'ap-northeast-1'
	},
	queueName : 'picup-mq',
	queueUrl : 'https://sqs.ap-northeast-1.amazonaws.com/063860250091/picup-mq',
	maxInFlight : 1,
	receiveBatchSize : 1,
	bodyFormat : 'json'
    }

};
