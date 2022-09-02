import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import SimpleModal from '../../../components/Modal';
import { Container } from '@material-ui/core';
// eslint-disable-next-line
import { getQuotesInfo, getQuoteItems, updateQuoteStatus, updateQuotationStatusForPricing, getPackingInfoForPricing, updateOtherFactorsInfo } from '../../../apis';
import useToken from '../../../hooks/useToken';
import '../../common.css'
import SimpleStepper from '../../../components/SimpleStepper';
// eslint-disable-next-line
import { roles } from '../../../constants/roles';
import { colors } from '../../../constants/colors';
import BasicTable from '../../../components/BasicTable';
import Template from '../../../components/Template';
import { useNavigate } from 'react-router-dom';

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

const QuoteDetailsPP = (props) => {
    const navigate = useNavigate()
    const classes = useStyles();
    const [quoteDetails, setQuoteDetails] = useState({});
    const [requestPrice, setRequestPrice] = useState(false);
    const [enableApprove, setEnableApprove] = useState(false);
    const [packingDetailsData, setPackingDetailsData] = useState([]);
    //eslint-disable-next-line
    const [allPackingDetailsData, setAllPackingDetailsData] = useState(null);
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
    // eslint-disable-next-line
    const { id, role } = getCurrentUserDetails();


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
            setQuoteDetails(res);
        });

        getPackingInfoForPricing({
            "quoteid": props.id?.toString(),
        }).then(response => {
            let tamp = [];
            setEnableApprove(response?.isapprovalbuttonenable);
            // eslint-disable-next-line
            response?.data?.map(item => {
                const indx = tamp?.findIndex(v => v?.quotelineitemid === item?.quotelineitemid);
                if (indx === -1) {
                    if (item?.factorname === 'PACKING COST') {
                        tamp.push({
                            'packing': {
                                'commrate': item?.commrate,
                                'pricedetid': item?.pricedetid,
                                'purgcrate': item?.purgcrate,
                                'factorname': item?.factorname
                            },
                            'pallet': {},
                            cartoncount: item?.cartoncount,
                            packingdescription: item?.packingdescription,
                            additionalrequirements: item?.additionalrequirements,
                            packdesc: item?.packdesc,
                            quoteid: item?.quoteid,
                            quotelineitemid: item?.quotelineitemid,
                            referencepackingcost: item?.referencepackingcost,
                            referencepackingcostusd: item?.referencepackingcostusd,
                            referencepalletcost: item?.referencepalletcost,
                            referencepalletcostusd: item?.referencepalletcostusd
                        });
                    } else {
                        tamp.push({
                            'pallet': {
                                'commrate': item?.commrate,
                                'pricedetid': item?.pricedetid,
                                'purgcrate': item?.purgcrate,
                                'factorname': item?.factorname
                            },
                            'packing': {},
                            cartoncount: item?.cartoncount,
                            packingdescription: item?.packingdescription,
                            additionalrequirements: item?.additionalrequirements,
                            packdesc: item?.packdesc,
                            quoteid: item?.quoteid,
                            quotelineitemid: item?.quotelineitemid,
                            referencepackingcost: item?.referencepackingcost,
                            referencepackingcostusd: item?.referencepackingcostusd,
                            referencepalletcost: item?.referencepalletcost,
                            referencepalletcostusd: item?.referencepalletcostusd
                        });
                    }

                } else {
                    var type = item.factorname === 'PACKING COST' ? 'packing' : 'pallet';
                    tamp[indx][type].commrate = item?.commrate;
                    tamp[indx][type].pricedetid = item?.pricedetid;
                    tamp[indx][type].purgcrate = item?.purgcrate;
                    tamp[indx][type].factorname = item?.factorname;
                }
            })

            setAllPackingDetailsData(tamp);
        });
    }

    useEffect(() => {
        let temp = [];
        // eslint-disable-next-line
        allPackingDetailsData?.map((item, index) => {
            temp.push({
                packing: <div><p>{item.packingdescription}</p><hr /><b>CARTON COUNT : {item.cartoncount}</b><br /><p >(COMPUTED FROM EOQ)</p><p><b>Additional Requirements: </b>{item.additionalrequirements}</p><p><b>Packing Description: </b>{item.packdesc}</p><br /></div>,
                packingCost: <div><p>{item.referencepackingcost || '0.00'}(INR)</p><p>{item.referencepackingcostusd || '0.00'}(USD)</p><p >As Per Packing List</p><input type="number" onChange={(e) => onPackingChange(e, 'packing', index)} value={item?.packing?.purgcrate} /></div>,
                palletCost: <div><p>{item.referencepalletcost || '0.00'}(INR)</p><p>{item.referencepalletcostusd || '0.00'}(USD)</p><p >As Per Packing List</p><input type="number" onChange={(e) => onPackingChange(e, 'pallet', index)} value={item?.pallet?.purgcrate} /></div>
            })
        });
        setPackingDetailsData(temp);
        // eslint-disable-next-line 
    }, [allPackingDetailsData]);

    const onPackingChange = (e, type, index) => {
        let temp = [...allPackingDetailsData];
        temp[index][type]['purgcrate'] = e.target.value;
        setAllPackingDetailsData(temp);
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, []);

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
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
    // eslint-disable-next-line
    const updateQuotationStatus = async (status) => {
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
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }


    // let samplePricingData = [
    //     {
    //         name: <div><h4>Dark Roasted Chicory Cubes</h4><hr /><p>Required Quantity: <br/>1,16,900</p></div>,
    //         previousRate: <div><p>(07-jan-2022)</p><br /><p>2.00</p></div>,
    //         dailyRate: '-',
    //         currentPrice: <input type="number" />,
    //         stockPrice: <input type="number" />,
    //     },
    //     {
    //         name: <div><h4>Dark Roasted Chicory Cubes</h4><hr /><p>Required Quantity: <br/>1,16,900</p></div>,
    //         previousRate: <div><p>(07-jan-2022)</p><br /><p>2.00</p></div>,
    //         dailyRate: '-',
    //         currentPrice:<input type="number" />,
    //         stockPrice: <input type="number" />,
    //     }
    // ];

    const packingDetailsCols = [
        { id: "packing", label: "Packing" },
        { id: "packingCost", label: "Packing Cost" },
        { id: "palletCost", label: "Pallet Cost" }
    ];
    // <p>Additional Description: </p><p>Packing Description: </p>
    // let packingDetailsData = [
    //     {
    //         packing: <div><p>48 X 25 GMS Round Jars</p><hr /><b>CARTON COUNT : 788</b><br /><p >(COMPUTED FROM EOQ)</p><br /></div>,
    //         packingCost: <div><p>0.000(INR)</p><p>0.000(USD)</p><p >As Per Packing List</p><input type="number" /></div>,
    //         palletCost: <div><p>0.000(INR)</p><p>0.000(USD)</p><p >As Per Packing List</p><input type="number" /></div>
    //     }
    // ];

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

    async function onSaveSamplePrice() {
        let data = [];
        // eslint-disable-next-line
        allPackingDetailsData?.map(item => {
            data.push({
                "pricedetid": item?.packing?.pricedetid,
                "quotelineitemid": item?.quotelineitemid?.toString(),
                "factorname": item?.packing?.factorname,
                "commrate": item?.packing?.commrate,
                "purgcrate": item?.packing?.purgcrate,
                "modifieduserid": getCurrentUserDetails()?.id
            })
            data.push({
                "pricedetid": item?.pallet?.pricedetid,
                "quotelineitemid": item?.quotelineitemid?.toString(),
                "factorname": item?.pallet?.factorname,
                "commrate": item?.pallet?.commrate,
                "purgcrate": item?.pallet?.purgcrate,
                "modifieduserid": getCurrentUserDetails()?.id
            })
        });
        try {
            let res = await updateOtherFactorsInfo(data);
            if (res) {
                setSnack({
                    open: true,
                    message: "packing and pallets sent successfully",
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
            "status": "PackingPriceReceived",
            "modifieduserid": id
        };

        try {
            let res = await updateQuotationStatusForPricing(data);
            if (res) {
                setSnack({
                    open: true,
                    message: "Packing Price received successfully",
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


        return (
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
                    {/* <Grid container className={classes.links} md={6}>
                        <Grid item md={3} xs={6} >
                            <SimplePopper linkLabel="Quote Item Information" body={quoteItemInfo} linkRef={quoteItemInfoRef}></SimplePopper>
                        </Grid>
                    </Grid> */}
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


            <>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Packing Details</Typography>
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={12} container direction="column">
                        <BasicTable rows={packingDetailsData} columns={packingDetailsCols} ></BasicTable>
                    </Grid>
                </Grid>
            </>


            {/* <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                    <Typography>Audit log information</Typography>
                </Grid>
            </Grid>
            <AuditLog data={logData} /> */}

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                {//role !== roles.managerPurchaseGCQuotes && 
                    <Grid item>
                        <Button label="Save" onClick={(e) => onSaveSamplePrice()} />
                    </Grid>
                }
                <Grid item>
                    <Button label="Cancel" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                <Grid item>
                    <Button label="Approve" disabled={!enableApprove} onClick={(e) => onApprovePrice()} />
                </Grid>
                {/* {role !== roles.managerPurchaseGCQuotes && <Grid item>
                    {getSaveButton()}
                </Grid>} */}
            </Grid>
            <SimpleModal open={requestPrice} handleClose={handleClose} body={requestPriceSuccess} />
        </>
    );
}
export default QuoteDetailsPP;