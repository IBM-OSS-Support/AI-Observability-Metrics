import streamlit as st
import os
import json
import plotly.express as px
import pandas as pd
import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import matplotlib.pyplot as plt
import seaborn as sns
from itertools import chain
import parse_metrics_data, parse_signals_data


def main():
        # Move header up and center-align
    st.markdown("""
        <div style="text-align:center; margin-top:-80px;">
            <h1>Graphsignal Metrics Dashboard</h1>
        </div>
    """, unsafe_allow_html=True)
    st.markdown("""
    <style>
        .reportview-container {
            margin-top: -2em;
        }
        #MainMenu {visibility: hidden;}
        .stDeployButton {display:none;}
        footer {visibility: hidden;}
        #stDecoration {display:none;}
    </style>
""", unsafe_allow_html=True)

    # Create a sidebar for deployment, model, and user
    st.sidebar.header('Configs & Params')
    deployment = st.sidebar.text_input('Deployment', parse_metrics_data.deployment)
    user = st.sidebar.text_input('User', parse_metrics_data.user)
    libraries = st.sidebar.text_input('Libraries', parse_signals_data.libraries)
    model = st.sidebar.text_input('Model', parse_metrics_data.model)
    temperature = st.sidebar.text_input('temperature', parse_signals_data.temperature)
    n = st.sidebar.text_input('n', parse_signals_data.n)
    stream = st.sidebar.text_input('stream', parse_signals_data.stream)
    stop = st.sidebar.text_input('stop', parse_signals_data.stop)


    # Create a tabbed layout
    tabs = st.tabs(['Performance', 'Data', 'System', 'Data Sample'])
    perf_met = parse_metrics_data.perf_metrics_dict
    data_met = parse_metrics_data.data_metrics_dict
    system_met = parse_metrics_data.system_metrice_dict

    merged_dict = {**perf_met, **data_met}
    unique_operations = list(set(merged_dict.keys()))

    default_selection = "All"
    # Create a DataFrame from perf_met
    df_perf_met = pd.DataFrame(perf_met).T

    def extract_val(entry):
        return entry['val']

      # Add content to the first tab
    with tabs[0]:
        st.markdown("<h6 style='text-align: center; '>CALL COUNT PLOTS</h6>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)

       # if selected_operation == 'All':
        #sns.set_style("whitegrid")
        fig, ax = plt.subplots(figsize = (12,13))       
        total_sum = df_perf_met['call_count'].apply(extract_val).sum()
        df = pd.DataFrame({'call_count': [total_sum]})
        sns.barplot(y="call_count", data=df, ax=ax, width=0.3,estimator=sum,color="grey",edgecolor=None)
        ax.set_xlabel('Call Count')
        ax.set_ylabel('Value')
        for i in ax.containers:
            ax.bar_label(i,)
    
        # Display the plot using Streamlit
        ax.set_title('Call Count Plot- Aggregated', pad=10)
        col1.pyplot(fig)
            

        # Donut
        operations = list(perf_met.keys())
        call_counts = [int(entry['call_count']['val']) for entry in perf_met.values()]
        # Define Seaborn color palette to use
        palette_color = sns.color_palette('Set3')
        # Create a pie chart using Matplotlib
        fig, ax = plt.subplots(figsize=(10, 15))
        def func(pct, allvals):
            absolute = int(np.round(pct/100.*np.sum(allvals)))
            return f"{pct:.1f}%\n({absolute:d})"
        wedges, texts, autotexts = ax.pie(call_counts,autopct=lambda pct: func(pct, call_counts), startangle=90,colors=palette_color, wedgeprops=dict(width=0.5, edgecolor='w'))
        # print("Texts........................")
        # print(texts)
        ax.legend(wedges, operations,
          title="operations",
          loc="center left",
          bbox_to_anchor=(1, 0, 0.5, 1))

        plt.setp(autotexts, size=8, weight="bold")
        texts[0].set_fontsize(25)
        # Set equal aspect ratio to ensure the pie is drawn as a circle
        ax.axis('equal')

        # Add a border around the pie chart       
        ax.add_patch(plt.Circle((0, 0), 0.6, color='white', linewidth=2, edgecolor='black'))
        ax.patch.set_linewidth(1)
        # Set title outside the border at the top
    

        # Adjust fontsize of labels and autopct
        for text in texts + autotexts:
            text.set_fontsize(12)

        # add border
        fig.patch.set_linewidth(3)
        fig.patch.set_edgecolor('black') 
        ax.set_title('Call Count by Operation')
        
        # Display the plot in Streamlit
        col2.pyplot(fig)
        
        ######################################## LATENCY ####################################################################################################

        st.markdown("<h6 style='text-align: center;'>LATENCY PLOTS</h6>", unsafe_allow_html=True)
        #latency
        # Extract relevant information from the 'latency' column
        df_perf_met['bins'] = df_perf_met['latency'].apply(lambda x: x['val']['bins'] if 'val' in x else [])
        df_perf_met['counts'] = df_perf_met['latency'].apply(lambda x: x['val']['counts'] if 'val' in x else [])

        # Convert counts to integers
        df_perf_met['counts'] = df_perf_met['counts'].apply(lambda x: [int(c) for c in x])
        print(df_perf_met.head(30))
        # Explode the lists in 'bins' and 'counts'
        df_perf_met_expanded = df_perf_met.explode('bins')
        df_perf_met_expanded['counts']=1

        # Reset the index and select columns to form a new DataFrame
        df = df_perf_met_expanded.reset_index()[['index', 'bins','counts']]
        print(df.head(30))
        # Plot Seaborn stacked bar chart
        fig, ax = plt.subplots(figsize=(12, 6))
        df.columns = ['index', 'bins','counts']
        df = df.sort_values(['bins'])
        print(f"columns of df : {df.columns}")
        df['counts'] = df['counts'].astype("int")
        df['latency_in_secs'] = df['bins'].astype(int)/1000000000
        bins_range = (0, 10)
        ax = sns.histplot(data=df, x='latency_in_secs', binrange=bins_range, kde=False,hue="index", multiple="stack",palette="cubehelix",legend=True)
        plt.xlabel('Bins')
        plt.ylabel('Count')
        plt.title('Histogram of Latency')
        plt.show()
        # Display the plot in Streamlit
        st.pyplot(fig)
 
    
    # Add content to the second tab
    with tabs[1]:
        # Create a multi-index DataFrame
        index = pd.MultiIndex.from_tuples([(column, sub_column, key) for column, sub_columns in data_met.items() for sub_column, sub_column_info in sub_columns.items() for key in sub_column_info.keys()],
                                        names=['Column', 'Subcolumn', 'Metric'])

        new_df = pd.DataFrame({'Value': [sub_column_info[key].get('val', 'NA') for sub_columns in data_met.values() for sub_column_info in sub_columns.values() for key in sub_column_info.keys()]},
                            index=index)
        # Reset index to convert MultiIndex to columns
        new_df.reset_index(inplace=True)
        new_df.columns  = ["Operation","Data_Category","Metric","Value"]
        new_df = new_df.sort_values(by="Metric")
        # Display the new DataFrame
        st.table(new_df)
        
    # Add content to the third tab
    with tabs[2]:
        # Create a DataFrame from the dictionary
        df = pd.DataFrame(system_met).T
        df = df["val"].reset_index()
        #df['val']= round(float(df["val"].values),2)
        df['val'] = pd.to_numeric(df['val']).round(2)
        print(df.head(2))
        #print(df.head(2))
        df.columns = ['Metric Name', 'Metric Value']
        #df['Unit'] = ["percentage","NA", "NA", "NA"]
        df['Unit'] = ["percentage","megabyte", "megabyte", "megabyte"]
        df['Metric Value'][1:4] = df['Metric Value'][1:4]*0.000001
        # Display the table
        #st.table(df)
        df.style.set_properties(**{'text-align': 'right'})
        st.table(df.style.format({"Metric Value": "{:.2f}"}))

        

    with tabs[3]:
        input = st.text_input('input', parse_signals_data.input_decoded)
        action = st.text_input('action', parse_signals_data.action_decoded)
        output = st.text_input('output', parse_signals_data.output_decoded)


  

if __name__ == "__main__":
    main()