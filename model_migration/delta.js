/**
 * Created by impyeong-gang on 1/11/16.
 */
var DeltaScheme = require('./scheme').DELTA;

module.exports = function(connection){
    return connection.define(DeltaScheme.TABLE, DeltaScheme.SCHEME, DeltaScheme.OPTION);
};
