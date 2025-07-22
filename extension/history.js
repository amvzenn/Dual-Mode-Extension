// history.js

document.addEventListener("DOMContentLoaded", () => {
  const deleteHistoryBtn = document.getElementById("deleteHistoryBtn");
  const historyRange = document.getElementById("historyRange");

  if (deleteHistoryBtn) {
    deleteHistoryBtn.addEventListener("click", () => {
      const value = historyRange.value;
      const millisecondsAgo = getTimeSince(value);

      if (millisecondsAgo === null) {
        alert("Invalid time range.");
        return;
      }

      chrome.browsingData.remove({
        since: Date.now() - millisecondsAgo
      }, {
        history: true
      }, () => {
        alert("Browsing history deleted.");
      });
    });
  }

  function getTimeSince(option) {
    const hour = 60 * 60 * 1000;
    switch (option) {
      case "hour": return hour;
      case "day": return 24 * hour;
      case "week": return 7 * 24 * hour;
      case "month": return 4 * 7 * 24 * hour;
      case "forever": return 0;
      default: return null;
    }
  }
});
