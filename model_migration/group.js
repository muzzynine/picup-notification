/**
 * Created by impyeong-gang on 1/11/16.
 */
var GroupScheme = require('./scheme').GROUP;

module.exports = function(connection){
    var Group = connection.define(GroupScheme.TABLE, GroupScheme.SCHEME, GroupScheme.OPTION);

    return Group;
};

