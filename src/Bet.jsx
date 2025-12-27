const Bet = (props) => {
  const { bet } = props;
  return (
    <div className="bet">
      <div className="bet-title">Next number is odd?</div>
      <div className="bet-info">
        <div className="bet-option">
          Yes <span className="bet-odds">50%</span>
        </div>
        <div className="bet-option">
          No <span className="bet-odds">50%</span>
        </div>
      </div>
    </div>
  );
};

export default Bet;
