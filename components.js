// Function to format the expression string for display
const formatExpression = (expr) => {
    if (typeof expr !== 'string') return '';
    return expr
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/\+/g, ' + ')
        .replace(/-/g, ' - ')
        .replace(/\^/g, '^')
        .replace(/sqrt/g, '√');
};

const ResultDisplay = ({ solution }) => {
    if (!solution) return null;

    const renderSigma = () => {
        const { start, end, body } = solution.sigma;
        return (
            <div className="flex items-center justify-center text-xl md:text-2xl">
                <div className="text-4xl md:text-5xl font-serif mr-1">Σ</div>
                <div className="flex flex-col text-sm items-center -ml-2">
                    <span className="block -mb-1">{end}</span>
                    <span className="block">i = {start}</span>
                </div>
                <div className="ml-2 text-2xl md:text-3xl">
                    ({formatExpression(body)})
                </div>
            </div>
        );
    };

    return (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 text-center">
            {solution.type === 'sigma' ? (
                renderSigma()
            ) : (
                 <div className="text-2xl md:text-3xl font-mono tracking-tight text-gray-800 break-words">
                    {formatExpression(solution.expression)}
                </div>
            )}
            <div className="text-3xl md:text-4xl font-bold text-indigo-600 mt-2">
                = {solution.value}
            </div>
        </div>
    );
};

export default ResultDisplay;
