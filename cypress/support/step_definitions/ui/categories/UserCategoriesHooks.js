import { Before } from '@badeball/cypress-cucumber-preprocessor';

Before({ tags: '@TC_UI_CAT_USER_04' }, function () {});

Before({ tags: '@TC_UI_CAT_USER_03 or @TC_UI_CAT_USER_04 or @authorization' }, function () {});
