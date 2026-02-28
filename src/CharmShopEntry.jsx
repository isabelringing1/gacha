export default function CharmShopEntry(props) {
  const { shopEntry, buyCharm, clubs, index } = props;
  function canBuy() {
    return clubs >= shopEntry.cost;
  }

  return (
    <div className={"charm-shop-entry entry-" + index}>
      <div className="charm-shop-info-container">
        <div className="charm-shop-entry-name">{shopEntry.name}</div>
        <div className="charm-shop-entry-desc">{shopEntry.desc}</div>
        <div className="charm-shop-entry-buy-button-container">
          <button
            onClick={() => buyCharm(shopEntry, index)}
            className="charm-shop-entry-buy-button"
            disabled={!canBuy()}
          >
            &#x2663;&#xfe0e; {shopEntry.cost}
          </button>
        </div>
      </div>
      <div className="charm-shop-img-container"></div>
    </div>
  );
}
