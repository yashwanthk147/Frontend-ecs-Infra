import React, { useEffect, useState, useRef } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import QuoteItemList from './QuoteItemList';
import _ from 'lodash';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import SimpleModal from '../../../components/Modal';
import SimplePopper from '../../../components/Popper';
import { Container } from '@material-ui/core';
import { getQuotesInfo, getQuoteItems, getGCDataOnQuotes, updateGcPriceOnQuotes, updateQuotationStatusForPricing, updateQuoteStatus } from '../../../apis';
import useToken from '../../../hooks/useToken';
import '../../common.css'
import AuditLog from './AuditLog';
import SimpleStepper from '../../../components/SimpleStepper';
import { roles } from '../../../constants/roles';
import { colors } from '../../../constants/colors';
import BasicTable from '../../../components/BasicTable';
import { useNavigate, useSearchParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%'
        },
        '& .page-header': {
            width: '100%',
            marginBottom: 15,
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    card: {
        boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        marginBottom: 5
    },
    modal: {
        position: 'absolute',
        margin: 'auto',
        top: '30%',
        left: '30%',
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    button: {
        margin: theme.spacing(1),
        backgroundColor: colors.orange,
        color: colors.white,
        minWidth: 50,
        textTransform: 'capitalize',

        '&:hover': {
            backgroundColor: colors.orange,
            opacity: 0.8,
        },
        '& $MuiButton-label': {
            margin: 0,
        }
    },
}));

const QuoteDetailsPT = (props) => {
    const navigate = useNavigate()
    const classes = useStyles();
    const [quoteDetails, setQuoteDetails] = useState({});
    const [quoteItems, setQuoteItems] = useState([]);
    const [requestPrice, setRequestPrice] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enableApprove, setEnableApprove] = useState(false);
    const [logData, setLogData] = useState([]);
    const [GCDataQuote, setGCDataQuote] = useState(null);
    const [samplePricingData, setSamplePricingData] = useState([]);
    const quoteItemInfoRef = useRef(null)
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const sampleSteps = [
        'New',
        'Pricing',
        'Expired',
        'Customer Review',
        'Approved',
        'Rejected',
    ];
    const { getCurrentUserDetails } = useToken();
    const { id, role } = getCurrentUserDetails();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    // const sampleSteps = [ {
    //     'New': [
    //         'New',
    //     ]},
    //     {'Pricing': ['Quote Approved by BDM', 'Quote Rejected by BDM', 'Bid Resubmitted to BDM', 'Pending with BDM', 'Bid Submitted to GMC', 'Base Price Received']},
    //     {'Expired': ['Quote Expired', 'Validity Ext. Pending Approval', 'Quote Validity Ext. Rejected', 'Quote Validity Ext. Approved']},
    //     {'Customer Review': ['Quote Submitted']},
    //     {'Approved': ['Quote Approved']},
    //     {'Rejected': ['Quote Rejected']},
    // ]; 

    const fetchData = () => {
        console.log("Into this", props.id);
        getQuotesInfo({
            "type": "viewquote",
            "loggedinuserid": getCurrentUserDetails()?.id,
            "quote_number": props.id?.toString()
        }).then(res => {
            setLogData(res.audit_log);
            setQuoteDetails(res);
        });

        getQuoteItems({
            "quote_id":  parseInt(props.id),
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(response => {
            setQuoteItems(response ?? []);
        });

        getGCDataOnQuotes({
            "quoteid": props.id?.toString(),
        }).then(response => {
            // let temp = [];
            // eslint-disable-next-line
            // response?.data?.map(item => {
            //     if (temp?.findIndex(v => v.itemid === item.itemid) === -1) {
            //         temp.push(item);
            //     }
            // })
            setGCDataQuote(response?.data);
            setEnableApprove(response?.isapprovalbuttonenable)
        });
    }

    useEffect(() => {
        fetchData();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function samplePricingChange(e, type, item) {
        const val = e.target.value;
        let temp = [...GCDataQuote];
        // eslint-disable-next-line 
        temp?.map(item1 => {
            if (item?.itemid === item1?.itemid) {
                item1[type] = val;
            }
        })
        setGCDataQuote(temp);
    }

    useEffect(() => {
        let data = [];
        // eslint-disable-next-line
        GCDataQuote !== null && GCDataQuote.map(item => {
            data.push({
                name: <div><h4>{item?.itemname}</h4><hr /><p>Required Quantity: <br />{item?.requiredquantity}</p></div>,
                previousRate: <div><p>({item?.previousgcrategivendate})</p><br /><p>{item?.previousgcrate}</p></div>,
                dailyRate: '-',
                currentPrice: <input type="number" disabled={!item?.currentpricerequested} value={!item?.currentpricerequested ? '' : item?.currentprice} onChange={(e) => samplePricingChange(e, 'currentprice', item)} />,
                stockPrice: <input type="number" disabled={!item?.stockpricerequested} value={!item?.stockpricerequested ? '' : item?.stockprice} onChange={(e) => samplePricingChange(e, 'stockprice', item)} />,
            }
            )
        })
        setSamplePricingData(data);
        // eslint-disable-next-line
    }, [GCDataQuote]);

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
    }
    const payload = [
        {
            type: 'label',
            value: "Quote Id",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.quoteid,
            sm: '6'
        },
        {
            type: 'label',
            value: "Quote Number",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.quote_autogennumber,
            sm: '6'
        },
        {
            type: 'label',
            value: "Quote Creation Date",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: formatDate(quoteDetails.createddate),
            sm: '6'
        },
        {
            type: 'label',
            value: "Contact Name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.contactname,
            sm: '6'
        }
    ];

    const payload1 = [
        {
            type: 'label',
            value: "Exchange Rate USD(AS Per Requested Date)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails?.coporatecurrency,
            sm: '6'
        },
        {
            type: 'label',
            value: "Dispatch Period",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: "From " + formatDate(quoteDetails.fromdate) + " To " + formatDate(quoteDetails.todate),
            sm: '6'
        },
        {
            type: 'label',
            value: "Marketing Representative",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.createdby || '',
            sm: '6'
        },
        {
            type: 'label',
            value: "Total Expected Quantity (Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.totalexpectedqty,
            sm: '6'
        },

    ];

    

        const updateQuotationStatus = async (status) => {
            setLoading(!loading);
            try {
                let response = null;
                if (status === 'requestforprice') {
                    var msg = `To Commercial Team, <br /><br /> Quotation# ${quoteDetails.quote_autogennumber} for Customer ${quoteDetails.accountname} is created in ERP. Please provide base price. <br/><br /> Please click the below link for further details:<br/> https://erp.cclproducts.com/adminlogin.aspx <br /><br /> Note :This is an auto-generated email please don’t reply to this email. In case of any queries reach out to ravisai.v@continental.coffee`;
                    var sub = `Customer: ${quoteDetails.accountname} / Quotation: ${quoteDetails.quote_autogennumber} created in ERP - Action required.`;
                    // ?srt=editSALESQUOTATION_NEW.aspx%QUOTATIONID=${props?.id}
                    console.log('sub::', sub, msg)
                    response = await updateQuoteStatus({
                        type: status,
                        quote_id: props?.id.toString(),
                        updated_by: id,
                        "loggedinuserid": getCurrentUserDetails()?.id,
                        emailcontent: { message: msg, subject: sub }
                    });
                } else {
                    response = await updateQuoteStatus({
                        type: status,
                        quote_id: props?.id.toString(),
                        updated_by: id,
                    });
                }
    
                console.log("Response", response);
                if (response) {
                    setRequestPrice(!requestPrice);
                    setTimeout(() => {
                        handleClose();
                    }, 2000)
                    setLoading(!loading);
                }
            } catch (e) {
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
        }
        // eslint-disable-next-line
        const getSaveButton = () => {
            if (quoteDetails?.status === "New" && quoteItems?.length > 0 && quoteItems?.reduce((accumulator, current) => {
                return accumulator &&
                    !_.isEmpty(current?.category)
            }, true)) {
                return <Button disabled={loading} label={loading ? "Loading..." : "Request Price"}
                    onClick={() => updateQuotationStatus("requestforprice")} />
            }
           
            else {
                return null
            }
        }

    const requestPriceSuccess = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Success
            </h2>
            <p>Request submitted for Quote number: {props.id} and email sent successfully</p>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Close" onClick={handleClose} />
                </Grid>
            </Grid>
        </Container>
    );

    const handleClose = () => {
        setRequestPrice(!requestPrice);
        navigate(-1, { replace: true });
    }

    // const requestPriceAction = async (e) => {
    //     try {
    //         let response = await requestQuotePriceInfo({
    //             "type": "requestprice",
    //             "quote_number": props.id?.toString()
    //         });
    //         console.log("Response", response);
    //         if (response) {
    //             setRequestPrice(!requestPrice);
    //             setTimeout(() => {
    //                 handleClose();
    //             }, 2000)
    //         }
    //     } catch (e) {
    //         setSnack({
    //             open: true,
    //             message: e.message,
    //             severity: 'error',
    //         })
    //     }
    // }


    const samplePricingCols = [
        { id: "name", label: "Item name" },
        { id: "previousRate", label: "Previous Rates" },
        { id: "dailyRate", label: "Daily Rates (onDate)" },
        { id: "currentPrice", label: "Market Price MT(USD)" },
        { id: "stockPrice", label: "Stock Price MT(USD)" }
    ];


    const allStatus = [
        { 'Quote Approved by BDM': 'Pricing' },
        { 'New': 'New' },
        { 'Quote Expired': 'Expired' },
        { 'Quote Rejected': 'Rejected' },
        { 'Quote Rejected by BDM': 'Pricing' },
        { 'Validity Ext. Pending Approval': 'Expired' },
        { 'Bid Resubmitted to BDM': 'Pricing' },
        { 'Quote Approved': 'Approved' },
        { 'Quote Submitted': 'Customer Review' },
        { 'Pending with BDM': 'Pricing' },
        { 'Bid Submitted to GMC': 'Pricing' },
        { 'Quote Validity Ext. Rejected': 'Expired' },
        { 'Base Price Received': 'Pricing' },
        { 'Quote Validity Ext. Approved': 'Expired' },
    ];

    const getActiveStep = () => {
        // var data = null;
        // allStatus.map((item, index) => {
        //     if(item[quoteDetails.status] !== undefined){
        //         return item[quoteDetails.status];
        //     }
        // })
        var data = allStatus?.find(i => i[quoteDetails?.status])
        // return data;
        var dataIndex = (data !== null && quoteDetails?.status !== undefined) && sampleSteps?.findIndex(i => i === data?.[quoteDetails?.status])
        return dataIndex + 1;
    };

    const quoteItemInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container ref={quoteItemInfoRef}>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Item Information</Typography>
                </Grid>
            </Grid>
            <Grid container direction="row">
                <Grid xs={6} item>
                </Grid>
                {quoteDetails?.status !== "New" ? null :
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {role !== roles.managerPurchaseGCQuotes && <Fab label={"Create Quote Item"} variant="extended" onClick={() => {
                            navigate(`/quote-item/${quoteDetails?.accountid}/${props.id}/${quoteDetails?.quote_autogennumber}/create?clonedQuoteId=${quoteDetails?.cloned_quoteid}`)
                        }}
                            quoteId={props.id} />}
                    </Grid>}
            </Grid>
            <QuoteItemList data={quoteItems} quoteItemDetails={(event, quoteItemId) => navigate(`/quote-item/${quoteDetails?.accountid}/${quoteItemId}/view?status=${quoteDetails?.status}`)} />
        </Container>
    );

    async function onSaveSamplePrice() {
        let data = [];
        // eslint-disable-next-line
        GCDataQuote?.map(item => {
            var indx = data?.findIndex(v => v.itemid === item.itemid);
            if (indx === -1) {
                data.push({
                    "quoteid": props.id?.toString(),
                    "itemid": item?.itemid,
                    "currentprice": item?.currentprice,
                    "stockprice": item?.stockprice,
                    "modifieduserid": getCurrentUserDetails()?.id
                })
            }
        });
        try {
            let res = await updateGcPriceOnQuotes(data);
            if (res) {
                setSnack({
                    open: true,
                    message: "Sample Price sent successfully",
                });
                setTimeout(() => {
                    handleClose();
                }, 2000)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    async function onApprovePrice() {
        let data = {
            "quoteid": props.id?.toString(),
            "status": "GCPriceReceived",
            "modifieduserid": id
        };

        try {
            let res = await updateQuotationStatusForPricing(data);
            if (res) {
                setSnack({
                    open: true,
                    message: "GC Price received successfully",
                });
                setTimeout(() => {
                    handleClose();
                }, 2000)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    return (<>
        <>
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Card className="page-header">
                <CardHeader
                    title=" Quotation Details"
                    className='cardHeader'
                />
                <CardContent>
                    <Grid container md={6}>
                        <Grid item md={3} xs={12} >
                            <Typography variant="h7">Quotation No</Typography>
                            <Typography>{quoteDetails.quote_autogennumber}</Typography>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <Typography variant="h7">Quote Creation</Typography>
                            <Typography>{formatDate(quoteDetails.createddate)}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container className={classes.links} md={6}>
                        <Grid item md={3} xs={6} >
                            <SimplePopper linkLabel="Quote Item Information" body={quoteItemInfo} linkRef={quoteItemInfoRef}></SimplePopper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="page-header">
                <CardContent>
                    <Grid container md={12}>
                        <Grid item md={12} xs={12}>
                            {getActiveStep() !== false &&
                                <SimpleStepper
                                    activeStep={getActiveStep()}
                                    steps={sampleSteps}
                                    quoteSteps={true}
                                    stepClick={(e) => {
                                        console.log("e::", e);
                                    }}
                                ></SimpleStepper>
                            }
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Information</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload1} />
                </Grid>
            </Grid>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Samples For Pricing</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={samplePricingData} columns={samplePricingCols} ></BasicTable>
                </Grid>
            </Grid>



            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                    <Typography>Audit log information</Typography>
                </Grid>
            </Grid>
            <AuditLog data={logData} />

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                {(status !== 'GC Price Received') &&
                    <Grid item>
                        <Button label="Save" onClick={(e) => onSaveSamplePrice()} />
                    </Grid>
                }
                <Grid item>
                    <Button label="Cancel" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                {(status !== 'GC Price Received') &&
                    <Grid item>
                        <Button label="Approve" disabled={!enableApprove} onClick={(e) => onApprovePrice()} />
                    </Grid>}
 <Grid item>
                    {getSaveButton()}
                </Grid>
            </Grid>
            <SimpleModal open={requestPrice} handleClose={handleClose} body={requestPriceSuccess} />
        </>
    </>
    );
}
export default QuoteDetailsPT;