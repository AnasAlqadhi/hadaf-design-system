/* global React */

function LeagueTable({ rows, lang }) {
  const headers = lang==='ar'
    ? ['#','الفريق','لعب','ف','ت','خ','له','عليه','نقاط']
    : ['#','Team','P','W','D','L','GF','GA','Pts'];
  return (
    <table className="hd-table">
      <thead>
        <tr>{headers.map((h,i) => <th key={i} className={i===1?'hd-t-team':''}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.highlight ? 'is-highlight' : ''}>
            <td className="hd-t-pos">{i+1}</td>
            <td className="hd-t-team">
              <img src={r.crest} alt=""/>
              <span>{lang==='ar' ? r.ar : r.en}</span>
            </td>
            <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
            <td>{r.gf}</td><td>{r.ga}</td>
            <td className="hd-t-pts">{r.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

window.HdLeagueTable = LeagueTable;
