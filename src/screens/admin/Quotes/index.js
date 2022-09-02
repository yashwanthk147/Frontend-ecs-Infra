import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import QuotesList from './QuotesList';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { getQuotes, getQuotesInfo } from "../../../apis";
import useToken from '../../../hooks/useToken';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import Snackbar from '../../../components/Snackbar';
import _ from 'lodash';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { roles } from '../../../constants/roles';
import PendingQuoteItemList from './PendingQuoteItemList';
import { useNavigate } from 'react-router-dom';
import { routeBuilder } from '../../../utils/routeBuilder';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    formControl: {
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        minWidth: 120,
    },
}));

const Quotes = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails?.role;
    const currentUserId = currentUserDetails?.id;
    const inputLabel = React.useRef(null);
    const classes = useStyles();
    const navigate = useNavigate();

    const [state, setState] = useState((role === roles.managingDirector || role === roles.gmc || role === roles.managerPurchaseGCQuotes) ?
        'All Quotes' : "myquotes");
    const [quotes, setQuotes] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '' })
    const [statusList, setStatusList] = useState([]);
    const [filter, setFilter] = useState("");
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [labelWidth, setLabelWidth] = React.useState(0);

    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data?.map(v => formattedData.push({ label: v[key], value: v[key] }))
        return formattedData;
    }
    const fetchquoteStatuses = async () => {
        try {
            let response = await getQuotesInfo({ type: "listquotationstatus", "loggedinuserid": getCurrentUserDetails()?.id, });
            const existingOptions = [{ label: 'All Quotes', value: 'All Quotes' },
            { label: 'My Quotes', value: 'myquotes' },
            { label: 'Pending Negative Margin Quotelines', value: 'PendingNegativeMarginQuotelines' },
            ]
            setStatusList(existingOptions.concat(formatToSelection(response, "status", "id")))
        }
        catch (error) {
            setSnack({ open: true, message: error, severity: 'error' });
            setTimeout(({
                open: false,
                message: 'Server Error. Please contact administrator', //e.response?.data
            }))
        }
    }
    const getData = async (filter, state) => {
        console.log("Val ", filter, state);

        let filterString = "";
        if ((role !== roles.managingDirector && role !== roles.gmc && role !== roles.managerPurchaseGCQuotes) || state === "myquotes") {
            filterString = filterString + `createdbyuserid = '${currentUserId}'`
        }
        if (state !== "All Quotes" && state !== "myquotes") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (state === 'GC Price Requested') {
            filterString = 'GcPriceRequested';
        }
        if (state === 'GC Price Received') {
            filterString = 'GcPriceReceived';
        }
        if (state === 'Packing Price Requested') {
            filterString = 'PackingPriceRequested';
        }
        if (state === 'Packing Price Received') {
            filterString = 'PackingPriceReceived';
        }
        if (state === 'Price Rejected') {
            filterString = 'PriceRejected';
        }
        if (state === 'Price Requested') {
            filterString = 'PriceRequested';
        }
        if (state === 'Price Approved') {
            filterString = 'PriceApproved';
        }
        if (state === 'Base Price Requested') {//&& currentUserDetails.role === roles.BusinessDevelopmentManager
            filterString = `status = '${state}'`;
        }
        if (state === 'Bid Submitted to GMC') {//&& currentUserDetails.role === roles.BusinessDevelopmentManager
            filterString = `status = '${state}'`;
        }        
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let filterStringPending = state;
        let data = { filter: state === 'PendingNegativeMarginQuotelines' ? filterStringPending : filterString, loggedinuserid: currentUserId }

        try {
            let response = await getQuotes(data);
            console.log("Response", response);
            // if (response) {
            setQuotes(response);
            // }
        } catch (e) {
            setQuotes([]);
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }


    };
    useEffect(() => {
        getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, filter]);
    useEffect(() => {
        fetchquoteStatuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleChange = (event) => {
        setState(event.target.value);
        setFilter(null)
    };

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    return (
        <Container className={classes.root}>
            {snack.open && <Snackbar {...snack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <>
                <Grid container direction="row">
                    <Grid xs={6} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel shrink ref={inputLabel} htmlFor="outlined-age-always-notched">View</InputLabel>
                            
                            <Select
                                native
                                value={state}
                                onChange={handleChange}
                                label="View"
                                input={
                                    <OutlinedInput
                                        notched
                                        labelWidth={labelWidth}
                                        name="age"
                                        id="outlined-age-always-notched"
                                    />
                                }
                            >
                                {statusList.map((item, index) => {
                                    if (role !== roles.managingDirector && role !== roles.gmc && role !== roles.managerPurchaseGCQuotes && item?.value === "All Quotes") {
                                        return null
                                    } else if (currentUserDetails.role === roles.managerPurchaseGC) {
                                        return (
                                            item.label === 'GC Price Requested' || 
                                            item.label === 'GC Price Received' || 
                                            item.label === 'My Quotes'
                                            ) ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                    } else if (currentUserDetails.role === roles.packingExecutive) {
                                        return (
                                            item.label === 'Packing Price Requested' || 
                                            item.label === 'Packing Price Received' || 
                                            item.label === 'My Quotes'
                                        ) ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                    } else if (currentUserDetails.role === roles.marketingExecutive) {
                                        return (
                                            item.label !== 'GC Price Requested' &&
                                            item.label !== 'Pending Negative Margin Quotelines' &&
                                            item.label !== 'GC Price Received' &&
                                            item.label !== 'Packing Price Requested' &&
                                            item.label !== 'Packing Price Received' &&
                                            item.label !== 'Price Requested' &&
                                            item.label !== 'Price Approved' &&
                                            item.label !== 'Price Rejected'
                                            ) ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                    } else if (currentUserDetails.role === roles.BusinessDevelopmentManager) {
                                        return (
                                            item.label !== 'Pending Negative Margin Quotelines'
                                            ) ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                    } else {
                                        return <option value={item?.value} key={index}>{item?.label}</option>
                                    }
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    {state === 'PendingNegativeMarginQuotelines' ? <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}></Grid> :
                        <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                            {quotes !== null &&
                                <RoundButton
                                    onClick={() => exportExcel()}
                                    label='Export to excel'
                                // variant="extended"
                                />
                            }
                            {role !== roles.managerPurchaseGCQuotes ?
                                <Fab onClick={() => navigate(routeBuilder('quote'))} label={"Create Quote"} variant="extended" /> : null}
                        </Grid>}
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={quotes} tableName='Quotes' />
                }
                {state === 'PendingNegativeMarginQuotelines' ?
                    <PendingQuoteItemList data={quotes}
                        quoteItemDetails={(event, quoteItemId, quoteno, quoteStatus) => navigate(`/quote-item/${quoteItemId}/view?status=${quoteStatus}`)} />
                    :
                    <QuotesList selectedAdvancedFilters={(val) => setFilter(val)} currentState={state}
                        clearAdvancedFilters={() => setFilter(null)} data={quotes} quoteDetails={(event, quoteNumber, quoteStatus) =>
                            navigate(`/quote/${quoteNumber}/view?status=${quoteStatus}&state=${state}`)} />}
            </>
        </Container>
    )
}

export default Quotes;