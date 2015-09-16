
var Plan = {

    Tabs : {    // Tabs
        CurrentTab: 'P',
        Values: ['P', 'B', 'C', 'guid-reach', 'guid-reachwd', 'guid-effperf']
    },

    Sheet: {

        // on Init
        HideParams: false,
        HideLevels: [],

        Rows: [       // Tree definition: Element GUID, index in tree, Level in tree, Parent index in tree
                { GUID: 'guid-all', Index: 0, Level: 0, ParentIndex: null, Open: true },
                { GUID: 'guid-camp1', Index: 1, Level: 3, ParentIndex: 0 },
                { GUID: 'guid-camp2', Index: 2, Level: 3, ParentIndex: 0 },
                { GUID: 'guid-group1', Index: 3, Level: 1, ParentIndex: 0, Open: true },
                { GUID: 'guid-radio', Index: 4, Level: 2, ParentIndex: 3, Open: true },
                { GUID: 'guid-camp2', Index: 5, Level: 3, ParentIndex: 4 },
                { GUID: 'guid-TV', Index: 6, Level: 2, ParentIndex: 3, Open: true },
                { GUID: 'guid-camp1', Index: 7, Level: 3, ParentIndex: 6, Open: true },
                { GUID: 'guid-prime', Index: 8, Level: 4, ParentIndex: 7 },
                { GUID: 'guid-afternoon', Index: 9, Level: 4, ParentIndex: 7 },
                { GUID: 'guid-morning', Index: 10, Level: 4, ParentIndex: 7 },
                { GUID: 'guid-camp2', Index: 11, Level: 3, ParentIndex: 6, Open: true },
                { GUID: 'guid-prime', Index: 12, Level: 4, ParentIndex: 11 },
                { GUID: 'guid-afternoon', Index: 13, Level: 4, ParentIndex: 11 },
                { GUID: 'guid-morning', Index: 14, Level: 4, ParentIndex: 11 },
                { GUID: 'guid-group2', Index: 15, Level: 1, ParentIndex: 0, Open: true },
                { GUID: 'guid-outdoor', Index: 16, Level: 2, ParentIndex: 15, Open: true },
                { GUID: 'guid-camp1', Index: 17, Level: 3, ParentIndex: 16 },
                { GUID: 'guid-camp2', Index: 18, Level: 3, ParentIndex: 16 }
        ],

        // Weeks
        Columns: [  'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4',
                    'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9',
                    'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14',
                    'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Week 19']
    }
};
