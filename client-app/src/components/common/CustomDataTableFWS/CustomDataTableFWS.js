import React from 'react';

const CustomDataTableFWS = ({ data }) => {
  
  return (
    <table>
      <thead>
        <tr>
          <th>Application Name</th>
          <th>Harassment</th>
          <th>Harassment/Threatening</th>
          <th>Hate</th>
          <th>Hate/Threatening</th>
          <th>Self-harm</th>
          <th>Self-harm/Instructions</th>
          <th>Self-harm/Intent</th>
          <th>Sexual</th>
          <th>Sexual/Minors</th>
          <th>Violence</th>
          <th>Violence/Graphic</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.application_name}</td>
            <td>{row.categories.harassment ? 'true' : 'false'}</td>
            <td>{row.categories.harassment/threatening ? 'true' : 'false'}</td>
            <td>{row.categories.hate ? 'true' : 'false'}</td>
            <td>{row.categories.hate/threatening ? 'true' : 'false'}</td>
            <td>{row.categories.self-harm ? 'true' : 'false'}</td>
            <td>{row.categories.self-harm/instructions ? 'true' : 'false'}</td>
            <td>{row.categories.self-harm/intent ? 'true' : 'false'}</td>
            <td>{row.categories.sexual ? 'true' : 'false'}</td>
            <td>{row.categories.sexual/minors ? 'true' : 'false'}</td>
            <td>{row.categories.violence ? 'true' : 'false'}</td>
            <td>{row.categories.violence/graphic ? 'true' : 'false'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CustomDataTableFWS;
