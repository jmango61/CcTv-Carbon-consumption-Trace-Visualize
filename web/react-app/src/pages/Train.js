import React, { useState, useEffect } from 'react';
import './Train.css';
import { PieChart, Pie, Cell } from 'recharts';

const ExecuteCommand = ({ endpoint, locationName }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: input })
      });

      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다');
      }

      const data = await response.json();
      setOutput(data.output);
      setError('');
    } catch (err) {
      console.error('에러:', err);
      setOutput('');
      setError('명령을 실행하는 동안 오류가 발생했습니다.');
    }
  };

  return (
    <div className="terminal-container">
      <span className="resource-label">terminal ({locationName})</span>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={'Please enter the command'}
          required
          className="terminal-input"
        />
        <button type="submit" className="execute-btn">
          Execute
        </button>
      </form>
      {output && (
        <div>
          <h2>Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
      {error && (
        <div>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

const Train = () => {
  const [resourceUS, setResourceUS] = useState({
    cpu: 50,
    gpu: 60,
    used_memory: 70,
    cpu_info: 'Intel Core i7~~',
    gpu_info: 'NVIDIA GeForce RTX 3080~~',
    memory_info: 16,
    CI: 0.8
  });
  const [resourceUK, setResourceUK] = useState({
    cpu: 40,
    gpu: 70,
    used_memory: 80,
    cpu_info: 'AMD Ryzen 9~~',
    gpu_info: 'NVIDIA GeForce GTX 2080~~',
    memory_info: 32,
    CI: 0.6
  });
  const [resourceKR, setResourceKR] = useState({
    cpu: 30,
    gpu: 50,
    used_memory: 60,
    cpu_info: 'Intel Core i9~~',
    gpu_info: 'AMD Radeon RX 6800~~~',
    memory_info: 8,
    CI: 0.7
  });

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData('/get_resourceUS', setResourceUS);
    fetchData('/get_resourceUK', setResourceUK);
    fetchData('/get_resourceKR', setResourceKR);
  }, []);

  const renderResourceTerminal = (resource, locationName) => {
    const topData = [
      { name: 'CPU', value: resource.cpu },
      { name: 'GPU', value: resource.gpu },
      { name: 'Memory', value: resource.used_memory / resource.memory_info } // 수정된 부분
    ];

    const bottomData = [
      { name: 'Memory Info', value: resource.memory_info },
      { name: 'CI', value: resource.CI }
    ];

    const colors = ['#00FF00', '#FFFF00', '#FFA500', '#FF0000', '#00FFFF'];

    return (
      <div className="resource-terminal">
        <div className="resource-container">
          <span className="resource-label">resources in use ({locationName})</span>

          <div className="com-info">
            <p>CPU 이름: {resource.cpu_info}</p>
            <p>GPU 이름: {resource.gpu_info}</p>
            <p>탄소집약도: {resource.CI}</p>
          </div>

          <div className="top-chart">
            <div className="top-text">
              {topData.map((entry, index) => (
                <div className="circular-progress" key={index}>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={[entry, { name: 'Empty', value: 100 - entry.value }]}
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius="40%"
                      outerRadius="60%"
                      fill={[colors[index], '#eee']}
                      dataKey="value"
                      labelLine={false}
                    >
                      <Cell key={`cell-${index}`} />
                      <Cell key={`cell-${index + 1}`} fill="#eee" />
                    </Pie>
                  </PieChart>
                  <div className="inner">
                    <span
                      className="resource-name"
                      style={{ marginLeft: index === 0 ? '34px' : index === 1 ? '35px' : '23px' }}
                    >
                      {entry.name}
                    </span>
                    <br />
                    <span
                      className="resource-value"
                      style={{ marginLeft: index === 0 ? '34px' : index === 1 ? '35px' : '23px' }}
                    >
                      {entry.name === 'Memory'
                        ? `${(entry.value * 100).toFixed(2)}%`
                        : `${entry.value}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ExecuteCommand endpoint={`/ssh${locationName}`} locationName={locationName} />
      </div>
    );
  };

  return (
    <div className="container">
      <div className="resource-terminal-wrapper">
        {renderResourceTerminal(resourceUS, 'US')}
        {renderResourceTerminal(resourceUK, 'UK')}
        {renderResourceTerminal(resourceKR, 'KR')}
      </div>
    </div>
  );
};

export default Train;
