var $container;
$.tag = function (sTag) { return $('<' + sTag + '></' + sTag + '>'); }

$(function () {   
    InitPage(Plan, $('.tabs-container'), $('.sheet-container'));
});

//var Provider;


//function setProvider(provider) {
//    Provider = provider;
//}


function InitPage(oPlan, $tabs, $sheet)
{

    //if (!Provider) {
    //    throw new Error('Missing Provider');
    //    return;
    //}

    //var oPlan = Provider.getGridInfo();

    //Dictionary = oPlan.Dictionary;
    //Formatting = oPlan.Formatting;


    if (!Dictionary || !Formatting) {
        throw new Error('Missing Constant objects (Dictionary, Formatting)');

    }
    if (!oPlan || !oPlan.Tabs || !oPlan.Tabs) {
        throw new Error('Missing complete definition of object Plan (Plan.Tabs, Plan.Sheet)');

    }
    if (!$tabs || !$sheet || !$tabs.length || !$sheet.length) {
        throw new Error('Destination elements ($tabs, $sheet) are undefined or do not exist on the page')
        return;
    }


    InitTabs(oPlan.Tabs, $tabs); // Tabs

    InitSheetStructure(oPlan.Sheet, $sheet);     // Sheet cells

    RefreshSheet(oPlan.Tabs.CurrentTab, false);  // Params, matrix and aggreg type

    //$(window).resize(function () { setTimeout(ResizeSheet, 200); });    // Resize event requires a timeout 
}
function InitTabs(aTabs, $tabs)
{
    var $ul = $.tag('ul').addClass('tabs');
    // Builds tabs and click events
    for (var i = 0; i < aTabs.Values.length; i++) {
        $ul.append(
            $.tag('li')
                .addClass('tab-link')
                .toggleClass('current', (aTabs.Values[i] === aTabs.CurrentTab))
                .attr('data-tab', aTabs.Values[i])
                .text(Dictionary[aTabs.Values[i]].Text)
                .on('click', function () {
                    if (!$(this).hasClass('current')) {
                        var tab = $(this).attr('data-tab');
                        $('ul.tabs li').removeClass('current');
                        $(this).addClass('current');
                        if (aTabs.CurrentTab !== tab) {
                            aTabs.CurrentTab = tab;
                            RefreshSheet(tab, false);
                        }
                    }
                }));
    }
    $tabs.empty().append($ul);
}

function InitSheetStructure(oSheet, $sheet) {
   
    $container = $sheet;

    var $table = $.tag('table').addClass('table');
    var $tr, $th, $td;
    var i, j, oRow;

    // Head
    var $thead = $.tag('thead');

    //      First row + first cell (toggle levels/toggle parameters)
    $tr = $.tag('tr')
        .addClass('header')
        .append($.tag('th')
            .addClass('first-col')
            .append($.tag('div')
                .addClass('togglelevelsbtn')
                    .append($.tag('div')
                        .addClass('togglegroupbtn show')
                        .attr('title', 'Hide/show Groups')
                        .text('Show Groups')
                        .on('click', function () {
                            $container.find('table.table div.togglegroupbtn').toggleClass('show hide');
                            ToggleLevels([0, 1]);
                        }))
                    .append($.tag('div')
                        .addClass('togglecampaignbtn show')
                        .attr('title', 'Hide/show Campaigns and Segments')
                        .text('Show Campaigns & Segments')
                        .on('click', function () {
                            $container.find('table.table div.togglecampaignbtn').toggleClass('show hide');
                            ToggleLevels([3, 4]);
                        })))
            .append($.tag('div')
                .addClass('toggleparamsbtn')
                .attr('title', 'Hide/show Parameters')
                .on('click', function () { ToggleParameters(300); }))
                );
    
    //      Weeks
    for (i = 0; i < oSheet.Columns.length; i++) {
        $tr.append($.tag('th')
            .addClass('week')
            .text(oSheet.Columns[i]));
    }
    $tr.append($.tag('th')
            .addClass('final'));
    $thead.append($tr);

    // Body
    var $indent = function (n) { return $.tag('div').addClass('treegrid-indent').css('width', n * 20); }
    var $expand = function (e) {
        return $.tag('div').addClass('treegrid-expander')
            .toggleClass('plus', (e === false))
            .toggleClass('minus', (e === true))
            .on('click', function () { ToggleTreeNode($(this).parents('tr')); });
    }
    var $text = function (t) { return $.tag('span').addClass('treegrid-nodetext').text(t); }
    var $tbody = $.tag('tbody');
    for (j = 0; j < oSheet.Rows.length; j++) {
        oRow = oSheet.Rows[j];
        //      New row
        $tr = $.tag('tr')
            .addClass('datarow row_' + j + ' level_' + oRow.Level)
            .toggleClass('treegrid-collapsed', (oRow.Open === false))
            .toggleClass('treegrid-expanded', (oRow.Open === true))
            .toggleClass('locked-row', Dictionary[oRow.GUID].Locked)
            .attr({
                'data-nodeid': oRow.Index,
                'data-parentid': oRow.ParentIndex
            });

        //      First col
        $tr.append($.tag('td')
                    .addClass('first-col ' + Dictionary[oRow.GUID].Class)
                    .css('border-left', '10px solid ' + Dictionary[oRow.GUID].Color)
                    .append($indent(oRow.Level))
                    .append($expand(oRow.Open))
                    .append($text(Dictionary[oRow.GUID].Text)));

        //      Week cols
        for (i = 0; i < oSheet.Columns.length; i++) {
            $tr.append($.tag('td')
                .addClass('week editable right cell_' + j + '_1_' + i));
        }

        //      Final col
        $tr.append($.tag('td')
                .addClass('final right cell_' + j + '_2_0'));

        $tbody.append($tr);
    }

    $container.data({
        'rowsnb': oSheet.Rows.length,
        'paramshidden': oSheet.HideParams
    }).empty()
      .append($table.append($thead).append($tbody));

    ToggleLevels(oSheet.HideLevels);

    var bHideGroups = ($.inArray(0, oSheet.HideLevels) > -1 && $.inArray(1, oSheet.HideLevels) > -1);
    $container.find('table.table div.togglegroupbtn').toggleClass('hide', bHideGroups).toggleClass('show', !bHideGroups);
    var bHideCampaigns = ($.inArray(3, oSheet.HideLevels) > -1 && $.inArray(4, oSheet.HideLevels) > -1);
    $container.find('table.table div.togglecampaignbtn').toggleClass('hide', bHideCampaigns).toggleClass('show', !bHideCampaigns);
}

function RefreshSheet(sTab, oCellUpdate)
{
    // THIS IS A SIMULATION

    $('body').css('cursor', 'wait').append($.tag('div').addClass('mask'));    // Wait mask

    var fn = function () {    // <= to simulate calculation time and return
        var oData;
        if (!sTab) oData = { Matrix: SimulatedReturnedData[$('.tab-link.current').attr('data-tab')].Matrix };
        else oData = SimulatedReturnedData[sTab || $('.tab-link.current').attr('data-tab')];

        //var oData = Provider.getGridData(sTab, oCellUpdate);

        if (oData.Parameters) InsertParamColumns(oData.Parameters);
        if (oData.Final) $container.find('table.table th.final').text(oData.Final);
        if (oData.Matrix) {
            if (oCellUpdate)
            {
                // Test: initial table (from matrix-interface.js) with current value modified
                oData.Matrix[oCellUpdate.Row][oCellUpdate.Table][oCellUpdate.Cell] = oCellUpdate.Value;
                // Test : sum horizontally
                var nSum = 0;
                for (var j = 0; j < oData.Matrix[oCellUpdate.Row][1].length; j++) {
                    nSum += parseInt(oData.Matrix[oCellUpdate.Row][1][j].replace(/,/g, ''));
                }
                if (oCellUpdate.Table === 1) oData.Matrix[oCellUpdate.Row][2][0] = Formatting[$('.tab-link.current').attr('data-tab')](nSum);
                // end test
            }
            UpdateMatrix(oData.Matrix);
        }

        if (sTab) ResizeSheet();

        $('.mask').remove();    // Wait mask off
        $('body').css('cursor', 'default');
        $container.find('table.table td.editmode input.editfield').select();
    }
    setTimeout(fn, 150);
}

function InsertParamColumns(aParams) {
    // Build the paramaters columns
    $container.find('table.table th.param,table.table td.param').remove();
    var $paramheaders = $(), $paramcells, i, j;

    // Param deader cells
    for (i = 0; i < aParams.length; i++) {
        $paramheaders = $paramheaders.add(
            $.tag('th')
            .addClass('param param_' + i)
            .toggleClass('hidden', $container.data('paramshidden'))
            .css('left', 313 + i * 104)         // A dynamiser
            .text(Dictionary[aParams[i]].Text));
    }
    $container.find('table.table th.first-col').after($paramheaders);

    // Param values cells
    for (j = 0; j < $container.data('rowsnb'); j++) {
        $paramcells = $();
        for (i = 0; i < aParams.length; i++) {
            $paramcells = $paramcells.add(
                $.tag('td')
                .addClass('param editable right param_' + i + ' cell_' + j + '_0_' + i)
                .toggleClass('hidden', $container.data('paramshidden'))
                .css('left', 313 + i * 104)     // A dynamiser
                .attr('data-param', aParams[i]));
        }
        $container.find('table.table tr.row_' + j + ' td.first-col').after($paramcells);
    }

    // Add absolute coordinates to matrix and save data
    $container.find('tr:not(.header)').each(function (rowi) {
        $(this).find('td:not(.first-col,.final)').each(function (coli) {
            $(this).attr('data-coord', coli + ',' + rowi);
        })
    });
    $container.data({
        scrolltoright: 1,
        scrolltoleft: 1,
        paramsnb: aParams.length
    });

    // Add hover and edit events
    $container.find('table.table td').hover(function () {
        if (!$(this).hasClass('editmode')) {
            $(this).siblings().andSelf().addClass('row-hover').each(function () {
                if (!$(this).parents('tr').hasClass('locked-row')       // Row is not locked
                    && $(this).hasClass('editable')                     // Cell is editable
                    && ($(this).hasClass('param') || (!$(this).hasClass('param') && !Dictionary[$('.tab-link.current').attr('data-tab')].IsOutcome)))  // Tab is not outcome and cell is not param
                        $(this).removeClass('row-hover').addClass('editable-row-hover');
            });

            if (!$(this).parents('tr').hasClass('locked-row')       // Row is not locked
                && $(this).hasClass('editable')                     // Cell is editable
                && ($(this).hasClass('param') || (!$(this).hasClass('param') && !Dictionary[$('.tab-link.current').attr('data-tab')].IsOutcome)))  // Tab is not outcome and cell is not param
            $(this).removeClass('row-hover editable-row-hover').addClass('editable-hover');
        }
    }, function () {
        $container.find('table.table td').removeClass('row-hover editable-row-hover editable-hover');
    });

    $container.find('table.table tr:not(.locked-row) td.editable')
        .on('click', function () {
            if ($(this).hasClass('param')
                || (!$(this).hasClass('param') && !Dictionary[$('.tab-link.current').attr('data-tab')].IsOutcome))
                    CellStartEditing($(this));
        });
    
    // Toggle params button
    $container.find('.toggleparamsbtn')
        .toggle(aParams.length > 0)
        .toggleClass('show', !$container.data('paramshidden'))
        .toggleClass('hide', $container.data('paramshidden'));
}

function UpdateMatrix(aMatrix) {
    if (!aMatrix) return;

    // Each row, table, cell
    var aRow, aTable;
    for (var nRow = 0; nRow < aMatrix.length; nRow++) {
        aRow = aMatrix[nRow];
        for (var nTable = 0; nTable < aRow.length; nTable++) {
            aTable = aRow[nTable];
            for (var nCell = 0; nCell < aTable.length; nCell++) {
                var $cell = $container.find('table.table td.cell_' + nRow + '_' + nTable + '_' + nCell);
                var sValue = aMatrix[nRow][nTable][nCell];
                if ($cell.hasClass('editmode')) $cell.find('input.editfield').val(sValue);
                else $cell.text(sValue);
            }
        }
    }
}

function CellStartEditing($cell, $leavingCell) {
    if ($leavingCell && $leavingCell.length) CellEndEditing($leavingCell); // Close previous edited cell first
    
    if (!$cell.length
        || $cell.hasClass('editmode')
        || !$cell.hasClass('editable')
        || $cell.parents('tr').hasClass('locked-row')
        ) return false;

    // Navigate out of scroll
    if (!$cell.hasClass('param')) {
        var nStr = $container.data('scrolltoright'), nStl = $container.data('scrolltoleft');
        if ($cell.offset().left + $cell.outerWidth() > $('.sheet-container').offset().left + $('.sheet-container').outerWidth()) {
            $('.sheet-container').scrollLeft($cell.outerWidth() * nStr);
            nStr++;
            nStl = 1;
        }
        else if ($cell.offset().left < $('.sheet-container').offset().left) {
            $('.sheet-container').scrollLeft($('.sheet-container').scrollLeft() - $cell.outerWidth() * nStl);
            nStl++;
            nStr = 1;
        }
        else nStr = nStl = 1;
        $container.data({ 'scrolltoright': nStr, 'scrolltoleft': nStl });
    }

    // Edit field
    var sValue = $cell.text();
    $cell.data('savedval', sValue)
        .addClass('editmode')
        .empty()
        .append(
            $.tag('input')
                .attr('type', 'text')
                .addClass('editfield')
                .val(sValue));

    $cell.find('input.editfield').select()
        .on('focusout', function () {
            CellEndEditing($cell);
        })
        .on('keydown', function (e) {
            if (e.keyCode === 9) {  // TAB
                CellStartEditing($getoffsetcell($cell, 1, 0), $cell);
                return false;
            }
        })
        .on('keyup', function (e) {
            switch (e.keyCode) { // SPACE,DEL
                case 32: case 46: 
                    $(this).val(''); 
                    break;   
                case 27: // ESC
                    $(this).val($cell.data('savedval'));
                    CellEndEditing($cell);
                    break;       
                case 37:    // LEFT
                    CellStartEditing($getoffsetcell($cell, -1, 0), $cell);
                    break; 
                case 39:    // RIGHT
                    CellStartEditing($getoffsetcell($cell, 1, 0), $cell);
                    break; 
                case 13: case 40: // ENTER,DOWN
                    var $next = $cell, bFound = false;                 
                    while (!bFound) {
                        $next = $getoffsetcell($next, 0, 1);
                        if (!$next) break;
                        bFound = bFound || !$next.parents('tr').hasClass('locked-row');
                    }
                    if (bFound) CellStartEditing($next, $cell);
                    break;
                case 38: // UP
                    var $next = $cell, bFound = false;
                    while (!bFound) {
                        $next = $getoffsetcell($next, 0, -1);
                        if (!$next) break;
                        bFound = bFound || !$next.parents('tr').hasClass('locked-row');
                    }
                    if (bFound) CellStartEditing($next, $cell);
                    break;
            }
        });
    $container.find('table.table .row-hover,'
        + 'table.table .editable-row-hover,'
        + 'table.table .editable-hover')
        .removeClass('row-hover editable-row-hover editable-hover');
    return true;
}
function CellEndEditing($cell) {
    if (!$cell || !$cell.hasClass('editmode')) return;
    var $edit = $cell.find('input.editfield');
    if (!$edit.length) return;

    var sValue = $.trim($edit.val());

    $cell.removeClass('editmode');
    $edit.remove();

    if (sValue === $cell.data('savedval')) {  // Reset (no change)
        $cell.text($cell.data('savedval'));
    }
    else {
        var sFormatKey = $cell.attr('data-param') || $('.tab-link.current').attr('data-tab');
        var fnFormat = Formatting[sFormatKey] || Formatting.default;
        var sFormattedVal = fnFormat(sValue);

        if (sFormattedVal !== false) { // Modify
            $cell.text(sFormattedVal);
            var aCoord = cellcoord($cell);
            var nParams = $container.data('paramsnb');
            RefreshSheet(false,
                {
                    Row: aCoord[1],
                    Table: (aCoord[0] < nParams) ? 0 : 1,
                    Cell: (aCoord[0] < nParams) ? aCoord[0] : aCoord[0] - nParams,
                    Value: sFormattedVal
                });
        }
        else { // Reset (Error)
            $cell.text($cell.data('savedval'));
        }
    }
}
function $getoffsetcell($c, nColDelta, nRowDelta) {
    // Get relative cell
    var aCoord = cellcoord($c);
    if (aCoord && aCoord.length === 2) return $container.find('table.table td[data-coord="' + (aCoord[0] + nColDelta) + ',' + (aCoord[1] + nRowDelta) + '"]');
}
function cellcoord($c) {
    // Get numeric coordinates
    var sCoord = $c.attr('data-coord');
    if (sCoord) return $.map(sCoord.split(','), function (nCoord) { return parseInt(nCoord); });
    else return false;
}

function ToggleTreeNode($tr)
{
    var sNodeIndex = $tr.attr('data-nodeid');

    if ($tr.hasClass('treegrid-expanded'))  // Close
        $descendants(sNodeIndex).hide();
    else if ($tr.hasClass('treegrid-collapsed'))    // Open
        $descendants(sNodeIndex, true).show();

    $tr.toggleClass('treegrid-collapsed').toggleClass('treegrid-expanded')  // Refesh img
        .find('.treegrid-expander').toggleClass('plus').toggleClass('minus');
}
function $descendants(sNodeIndex, bExpanded)
{
    // Recurvise build
    return (function fndesc($d, n) {
        var $children = $('.sheet-container table.table tr[data-parentid=' + n + ']');
        if (!$children.length ||
            (bExpanded
            && n !== sNodeIndex
            && $('.sheet-container table.table tr[data-nodeid=' + n + ']').hasClass('treegrid-collapsed'))) {
            return $d;
        }
        else {
            $children.each(function () { $d = fndesc($d, $(this).attr('data-nodeid')); });
            return $d.add($children);
        }
    })($(), sNodeIndex);
}

function ToggleParameters(nTime)
{
    var nParamLastIndex = $container.find('table.table th.param').length - 1;
    
    // Sequential closing animation
    (function fnclose($item, nIndex, nTotal) {
        if (!$item.length || $container.data('paramshidden')) return;

        nTotal = nTotal || nIndex + 1;
        if (nIndex < 0) {
            $container.data('paramshidden', true);
            ResizeSheet(nParamLastIndex + 1);
        }
        else {
            $item.filter('.param_' + nIndex)
                .animate({ width: 0 }, nTime / nTotal)
                .promise().done(function () {
                    $(this).addClass('hidden');
                    fnclose($item, nIndex - 1, nTotal);
                });
            
        }
        
    })($container.find('table.table .param:not(.hidden)'), nParamLastIndex);

    // Sequential opening animation
    (function fnopen($item, nTotal, nIndex) {
        if (!$item.length || !$container.data('paramshidden')) return;

        nIndex = nIndex || 0;
        if (nIndex === 0) $container.css('overflow-x', 'hidden');

        if (nIndex > nTotal) {
            $container.css('overflow-x', 'scroll');
            $container.data('paramshidden', false);
            ResizeSheet();        
        }
        else {
            $item.filter('.param_' + nIndex)
                .removeClass('hidden')
                .width(1)
                .animate({ width: 100 }, nTime / (nTotal + 1))
                .promise().done(function () {
                    fnopen($item, nTotal, nIndex + 1);
                });
        }
        
    })($container.find('table.table .param.hidden'), nParamLastIndex);

    $container.find('table.table div.toggleparamsbtn').toggleClass('show hide');
}

function ToggleLevels(aLevels)
{
    aLevels = aLevels || [];
    var nMinLevel = Infinity;
    for (var i = 0; i < aLevels.length; i++) {
        $container.find('table.table tr.level_' + aLevels[i]).toggle();
        nMinLevel = Math.min(nMinLevel, aLevels[i]);
        if (aLevels[i] > 0)
            $container.find('table.table tr.level_' + (aLevels[i] - 1) + ' td.first-col .treegrid-expander').toggle();
    }
}

function ResizeSheet(nAdjust) {
    nAdjust = nAdjust || 0;
    var nChromeAdjust = 0
    if (typeof window.chrome === "object") nChromeAdjust = 2;   // for Chrome

    // Scrollable area with
    var nScrollAreaWidth = $(window).width()
        - $('.sheet-container table.table th.first-col').outerWidth() 
        - $('.sheet-container table.table th.final').outerWidth();
    var nMatrixMarginLeft = $('.sheet-container table.table th.first-col').outerWidth();
    $('.sheet-container table.table th.param').each(function () {
        nScrollAreaWidth -= $(this).outerWidth();
        nMatrixMarginLeft += $(this).outerWidth();
    });
    $('.sheet-container').outerWidth(nScrollAreaWidth + nAdjust * 2 + nChromeAdjust);

    // Weeks table with
    var nWeeksAreaWidth = 0;
    $('.sheet-container table.table th.week').each(function () {
        nWeeksAreaWidth += $(this).outerWidth();
    });
    $('.sheet-container table.table').outerWidth(nWeeksAreaWidth);

    // Margin (fix left elements)
    $('.sheet-container').css('margin-left', nMatrixMarginLeft - nAdjust * 2 - nChromeAdjust);

    // for Chrome
    if (nChromeAdjust) $('.sheet-container table.table th.first-col, .sheet-container table.table td.first-col,'
                        + ' .sheet-container table.table th.param, .sheet-container table.table td.param,'
                        + ' .sheet-container table.table th.final, .sheet-container table.table td.final').css('margin-top', 0);
}