/**
 * @author v.lugovsky
 * created on 17.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.theme')
        .filter('kameleonImg', kameleonImg);

    /** @ngInject */
    function kameleonImg(layoutPaths) {
        return function (input) {
            // console.log(layoutPaths.images.root + 'theme/icon/kameleon/' + input + '.svg')
            // return layoutPaths.images.root + 'theme/icon/kameleon/' + input + '.svg';
            // return layoutPaths.images.root + 'theme/icon/kameleon/' + input +".gif";
            return layoutPaths.images.root + 'theme/icon/kameleon/' + input + ".png";
        };
    }

})();
