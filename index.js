const GET_API =
  "https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=d88ddddd8b055fefd7b1ad19fe60";
const POST_API =
  "https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=d88ddddd8b055fefd7b1ad19fe60";

const bestDateForPartners = (country, partners) => {
  let availableDate = null;
  let NoOfPartnersOnDate = {};
  let maxAttendees = -1;

  partners.forEach((d) => {
    const { availableDates } = d;

    let availableDates = availableDates.filter((dataOfDates, i) => {
      return (
        availableDates[i + 1] ===
        dayjs(dataOfDates).add(1, "day").format("YYYY-MM-DD")
      );
    });
    if (availableDates.length > 0) {
      availableDates.forEach((date) => {
        NoOfPartnersOnDate[date] = NoOfPartnersOnDate[date] || [];
        const partnerCount = NoOfPartnersOnDate[date].push(d);
        if (partnerCount > maxAttendees) {
          availableDate = date;
          maxAttendees = partnerCount;
        }
      });
    }
  }, []);

  return {
    attendeeCount: NoOfPartnersOnDate[availableDate].length,
    attendees: NoOfPartnersOnDate[availableDate].map((d) => d.email),
    name: country,
    startDate: availableDate,
  };
};

(async () => {
  try {
    const data_api_res = await fetch(GET_API);
    const result = await data_api_res.json();

    let groupByCountries = result.partners.reduce((current, partner) => {
      const { country } = partner;
      current[country] = current[country] || [];
      current[country].push(partner);
      return current;
    }, {});

    let countries = [];
    for (const [country, partners] of Object.entries(groupByCountries)) {
      countries.push(bestDateForPartners(country, partners));
    }

    const POST_api_result = await fetch(POST_API, {
      method: "POST",
      body: JSON.stringify({
        countries,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result_api_data = await POST_api_result.json();
    console.dir(result_api_data);
  } catch (e) {
    console.error(e);
  }
})();
