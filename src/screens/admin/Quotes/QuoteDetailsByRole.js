import React from 'react'
import QuoteDetailsMD from './QuoteDetailsMD';
import QuoteDetailsPT from './QuoteDetailsPT';
import QuoteDetailsComm from './QuoteDetailsComm';
import QuoteDetailsPP from './QuoteDetailsPP';
import QuoteDetails from './QuoteDetails';
import useToken from '../../../hooks/useToken';
import roles from '../../../constants/roles';
import { useParams, useSearchParams } from 'react-router-dom';

const QuoteDetailsByRole = () => {
    const { getCurrentUserDetails } = useToken();
    const { quoteId } = useParams();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const state = searchParams.get('state')
    const role = getCurrentUserDetails().role;

    if (role === roles.managingDirector && (state === 'Price Requested' || state === 'Price Approved')) {
        // md devApiUrl: 'https://c30j81s4jj.execute-api.ap-south-1.amazonaws.com/dev/dev-'
        return <QuoteDetailsMD id={quoteId} status={status}></QuoteDetailsMD>
    } else if (role === roles.managerPurchaseGC) {
        // purchase team
        return <QuoteDetailsPT id={quoteId} status={status}></QuoteDetailsPT>
    } else if (role === roles.packingExecutive) {
        // Manager Purchase Packing
        return <QuoteDetailsPP id={quoteId} status={status}></QuoteDetailsPP>
    } else if ((role === roles.BusinessDevelopmentManager)) {
        // commercial
        if ((state === 'Price Approved')) {
            // md devApiUrl: 'https://c30j81s4jj.execute-api.ap-south-1.amazonaws.com/dev/dev-'
            return <QuoteDetailsMD id={quoteId} status={status}></QuoteDetailsMD>
        } else if(status === 'Base Price Received' || status === 'Bid Submitted to GMC' || status === 'Quote Submitted') {
          return <QuoteDetails id={quoteId} status={status}></QuoteDetails>  
        }
        return <QuoteDetailsComm id={quoteId} status={status} state={state}></QuoteDetailsComm>
    } else {
        return <QuoteDetails id={quoteId} status={status}></QuoteDetails>
    }
}

export default QuoteDetailsByRole;