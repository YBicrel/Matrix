// Key-object based dictionnary
var Dictionary = {

    // Elements
    'guid-all': { Text: 'All', Color: '#000000',         Class: 'group', Locked: true },
    'guid-group1': { Text: 'Group1', Color: '#888888', Class: 'group', Locked: true },
    'guid-group2': { Text: 'Group2', Color: '#CCCCCC', Class: 'group', Locked: true },
    'guid-radio': { Text: 'Radio', Color: '#AA4411', Class: 'touchpoint', Locked: false },
    'guid-TV': { Text: 'TV', Color: '#44CC99', Class: 'touchpoint', Locked: false },
    'guid-outdoor': { Text: 'Outdoor', Color: '#FFAA33', Class: 'touchpoint', Locked: false },
    'guid-camp1': { Text: 'Camp1', Color: '#FFBBAA', Class: 'touchpoint-campaign', Locked: false },
    'guid-camp2': { Text: 'Camp2', Color: '#AABBFF', Class: 'touchpoint-campaign', Locked: false },
    'guid-prime': { Text: 'Prime-Time', Color: '#AA0000', Class: 'segment', Locked: false },
    'guid-afternoon': { Text: 'Afternoon', Color: '#99AA00', Class: 'segment', Locked: false },
    'guid-morning': { Text: 'Morning', Color: '#3344FF', Class: 'segment', Locked: false },

    // Input
     'P': { Text: 'Pressure' },
     'B': { Text: 'Budget' },
     'C': { Text: 'Cost' },

    // Outcomes
     'guid-reach': { Text: 'Reach', IsOutcome: true },
     'guid-reachwd': { Text: 'Reach w/ decay', IsOutcome: true },
     'guid-effperf': { Text: 'Effectiveness / Performance', IsOutcome: true },

    // Parameters
     'd': { Text: 'Decay' },
     'f': { Text: 'Frequency' }
};




// Input formatting functions
var Formatting = {

    // Parameters cells
    'd': function (s) { return Formatting._predefined.fnIntWithSuffixOrEmpty(s, '%'); },
    'f': function (s) { return Formatting._predefined.fnIntWithSuffixOrEmpty(s, '+'); },

    // Weeks cells
    'P': function (s) { return Formatting._predefined.fnIntWith1000SepOrEmpty(s, ','); },
    'B': function (s) { return Formatting._predefined.fnIntWith1000SepOrEmpty(s, ','); },
    'C': function (s) { return Formatting._predefined.fnIntWith1000SepOrEmpty(s, ','); },

    // Default formatting
    'default': function (s) { return s; },

    // fn ready to reuse
    _predefined: {
        fnIntWithSuffixOrEmpty: function (s, suff) {
            if (s === false) return false; // Always needed
            if ($.trim(s) === '') return ''; // Empty = ok
            if (s.indexOf(suff, s.length - suff.length) !== -1) s = s.substr(0, s.length - suff.length); // Ignore the suffix
            if (isNaN(s)) return false; // Reject non-number
            s = parseInt(s) + suff; // Cut off decimals, add suffix
            return s;
        },
        fnIntWith1000SepOrEmpty: function (s, sep) {
            if (s === false || isNaN(s)) return false; // Reject non-number
            if ($.trim(s) === '') return ''; // Empty = ok
            s = parseInt(s) + ''; // Cut off decimals
            var i, j = 0, ns = '';
            for (i = s.length - 1 ; i >= 0 ; i--) { // Separate thousands
                if (j != 0 && j % 3 == 0) ns = s[i] + sep + ns;
                else ns = s[i] + ns;
                j++;
            }
            return ns;
        }
    }
};