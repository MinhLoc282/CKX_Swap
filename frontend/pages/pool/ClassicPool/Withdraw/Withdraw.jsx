import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';
import {
  WithdrawIcon,
} from '../Utils';
import styles from './index.module.css';
import * as token0 from '../../../../../src/declarations/token0';
import * as token1 from '../../../../../src/declarations/token1';
import { useAuth } from '../../../../hooks/use-auth-client';

import WithdrawImg from '../../../../assets/withdraw.png';
import ckBTC from '../../../../assets/ckBTC.png';
import ckETH from '../../../../assets/ckETH.png';

function Withdraw() {
  const {
    swapActor, token0Actor, token1Actor, principal,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [decimals, setDecimals] = useState(0);
  const [amountInput, setAmountInput] = useState();
  const [tokenPrincipal, setTokenPrincipal] = useState('');

  const handleDeposit = async () => {
    try {
      setLoading(true);

      // Deposit tokens
      await swapActor.withdraw(
        Principal.fromText(tokenPrincipal),
        amountInput * 10 ** 18,
      );

      setLoading(false);

      // Check results
      toast.success('Withdraw successfully');
    } catch (e) {
      console.log(e);
      toast.error('Withdraw error');
      setLoading(false);
    }
  };

  const setMaxInput = () => {
    if (decimals && tokenBalance) {
      setAmountInput(tokenBalance / 10 ** decimals);
    }
  };

  useEffect(() => {
    const handleGetSupportedTokenList = async () => {
      const res = await swapActor.getSupportedTokenList();
      setTokenList(res);
      setTokenPrincipal(res[0].id);
    };

    if (swapActor) {
      handleGetSupportedTokenList();
    }
  }, [swapActor]);

  useEffect(() => {
    const getBalanceAndDecimals = async () => {
      if (tokenPrincipal && principal) {
        try {
          let balance;
          let dec;

          if (tokenPrincipal === token0.canisterId) {
            const res = await swapActor.getUserBalances(principal);
            balance = res.find((b) => b[0] === tokenPrincipal);
            dec = await token0Actor.icrc1_decimals();
          } else if (tokenPrincipal === token1.canisterId) {
            const res = await swapActor.getUserBalances(principal);
            balance = res.find((b) => b[0] === tokenPrincipal);
            dec = await token1Actor.icrc1_decimals();
          }

          setTokenBalance(Number(balance[1]));
          setDecimals(Number(dec));
        } catch (error) {
          console.error('Error fetching balance and decimals:', error);
        }
      }
    };

    getBalanceAndDecimals();
  }, [tokenPrincipal, token0Actor, token1Actor]);

  return (
    <div>
      <div className={styles.RightHeader}>
        <WithdrawIcon />
        Withdraw
      </div>
      <div>
        Withdraw to receive pool tokens and earned trading fees.
      </div>
      {/* <div style={{ marginTop: '32px' }}>
        <img src={WithdrawImg} width="60%" alt="" />
      </div> */}
      <div className={styles.Deposit}>
        <div className={styles.TitleContainer}>
          <h2 className={styles.Title}>Withdraw</h2>
        </div>

        <div>
          <div className={styles.LabelContainer}>
            <div className={styles.Label}>
              <div>Select amount</div>
              <div>
                Balance:
                {' '}
                {tokenBalance && decimals && <span>{tokenBalance / 10 ** decimals}</span>}
              </div>
            </div>
          </div>

          <div className={styles.InputContainer}>
            <div className={styles.InputGroup}>
              <div className={styles.IconContainer}>
                <select
                  value={tokenPrincipal}
                  onChange={(e) => setTokenPrincipal(e.target.value)}
                  className={styles.TokenSelect}
                >
                  {tokenList.map((tokenInfo) => (
                    <option
                      value={tokenInfo.id}
                      key={tokenInfo.id}
                      className={styles.TokenOption}
                    >
                      <span className={styles.Icon}>
                        {tokenInfo.symbol}
                        <img width={18} height={18} src={tokenInfo.symbol === 'ckBTC' ? ckBTC : ckETH} alt="" />
                      </span>
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                className={styles.InputFieldDeposit}
                placeholder="0.0"
                onChange={(e) => setAmountInput(e.target.value)}
                value={amountInput}
              />
              <button type="button" className={styles.MaxButton} onClick={setMaxInput}>
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          type="button"
          onClick={handleDeposit}
          disabled={loading}
          className={styles.TransferButton}
        >
          {loading ? 'Waiting...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
}

export default Withdraw;
